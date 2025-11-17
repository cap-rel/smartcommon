import { createContext } from "react";
import { useAuth, useStates } from "../../../hooks";
import { getLocalJSON, isEmpty, isFunction, removeLocal, removeSession, setLocal, setLocalJSON, setSessionJSON } from "../../../utils";
import { v4 } from "uuid";

export const AuthContext = createContext();

export const AuthProvider = (props) => {
  const { children, config } = props;

  const { url, errors: apiErrors } = config?.api ?? {};

  let appKeyId = getLocalJSON("HTTP_X_APP_ID");

  if (isEmpty(appKeyId)) {
    appKeyId = v4();
    setLocalJSON("HTTP_X_APP_ID", appKeyId);
  }
    
  const user = useSelector(state => state.user);
  
  const { access_token, refresh_token, tokenExpiry, rememberMe } = user ?? {};

  const login = async (loginInfo, request = {}, errors = {}) => {
    const response = await fetch(`${url}login`, {
      method: 'POST',
      headers: { 
        HTTP_X_APP_ID: appKeyId,
        'Content-Type': 'application/json'
      },
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
    const response = await fetch(`${url}logout`, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${access_token}`,
        HTTP_X_APP_ID: appKeyId
      },
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
    const response = await fetch(`${url}refresh`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${refresh_token}`,
        HTTP_X_APP_ID: appKeyId
      }
    });

    const json = await response.json();

    if (!response.ok) {
      await logout();
      throw new Error('Session expired. Please login again.');
      // throw new Error(json);
    }

    const { access_token, refresh_token: refreshToken, token_expires_in } = json?.data ?? {};

    const refreshUser = { ...user, access_token, refresh_token: refreshToken, tokenExpiry: Date.now() + (token_expires_in * 1000)};
    
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
        Authorization: `Bearer ${access_token}`,
        HTTP_X_APP_ID: appKeyId,
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

  const GET = (path, request, errors) => fetchApi(path, null, { ...request, method: "GET" }, errors);

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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
