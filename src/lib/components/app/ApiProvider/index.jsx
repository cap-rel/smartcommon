import { createContext } from "react";
import { useLib, useStates } from "../../../hooks";
import { getLocalJSON, isFunction, removeLocal, removeSession, setLocal, setLocalJSON, setSessionJSON } from "../../../utils";

export const ApiContext = createContext();

export const ApiProvider = (props) => {
  const { children } = props;

  const { api } = useLib() ?? {};

  const { url, errors: apiErrors } = api ?? {};
  
  const { states, set } = useStates({
    user: getLocalJSON("user") ?? null
  });
  
  const { user } = states;

  const { accessToken, refreshToken, tokenExpiry, rememberMe } = user ?? {};

  const login = async (loginInfo, request = {}, errors = {}) => {
    const response = await fetch('login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginInfo),
      ...request
    });

    const json = await response.json();

    const { ok, status } = response;
    
    if (!ok) {
      const errorAction = errors[status] ?? apiErrors[status];
      
      if (isFunction(errorAction)) {
        errorAction();
      }
      
      throw new Error(json);
    }

    const data = json?.data ?? {};

    const { expires_in, rememberMe } = data;

    const newUser = { ...data, tokenExpiry: Date.now() + (expires_in * 1000) }

    set("user", newUser);

    if (rememberMe) {
      setLocalJSON("user", newUser);
    } else {
      setSessionJSON("user", newUser);
    }

    return json;
  };

  const logout = async (request = {}, errors = {}) => {
    const response = await fetch("logout", {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` },
      ...request
    });

    const json = await response.json();

    // const { ok, status } = response;
    
    // if (!ok) {
    //   const errorAction = errors[status] ?? apiErrors[status];
      
    //   if (isFunction(errorAction)) {
    //     errorAction();
    //   }
      
    //   throw new Error(json);
    // }

    set("user", null);
    
    removeLocal("user");
    removeSession("user");

    return json;
  };

  const refreshAccessToken = async () => {
    const response = await fetch("refresh", {
      method: "GET",
      headers: { "Authorization": `Bearer ${refreshToken}` }
    });

    const json = await response.json();

    if (!response.ok) {
      await logout();
      throw new Error('Session expired. Please login again.');
      // throw new Error(json);
    }

    const { access_token, refresh_token, token_expires_in } = json?.data ?? {};

    const refreshUser = { ...user,
      accessToken: access_token,
      refreshToken: refresh_token,
      tokenExpiry: Date.now() + (token_expires_in * 1000)
    };
    
    set("user", refreshUser);

    if (rememberMe) {
      setLocalJSON("user", refreshUser);
    } else {
      setSessionJSON("user", refreshUser);
    }
  }

  const fetchApi = async (path, body, request = {}, errors = {}) => {
    // Check if token needs refresh (refresh 5 min before expiry)
    if (Date.now() > tokenExpiry - 300000) {
      await refreshAccessToken();
    }

    const response = await fetch(`${url}${path}`, {
      ...request,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const json = await response.json();

    const { ok, status } = response;
    
    if (!ok) {
      if (response.status === 401) {
        await refreshAccessToken();
        
        return await fetchApi(path, request, errors)
      }
      
      const errorAction = errors[status] ?? apiErrors[status];
      
      if (isFunction(errorAction)) {
        errorAction();
      }
      
      throw new Error(json);
    }


    return json;
  };

  const GET = (path, request, errors) => fetchApi(path, null, { ...request, method: "GET" }, requestErrors);

  const POST = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "POST" }, errors);

  const PUT = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "PUT" }, errors);

  const DELETE = (path, body, request, errors) => fetchApi(path, body, { ...request, method: "DELETE" }, errors);

  const value = {
    user,
    login,
    logout,
    fetchApi,
    GET,
    PUT,
    POST,
    DELETE
  }
  
  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};
