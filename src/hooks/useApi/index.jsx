import { isFunction } from "../../globals";

export const useApi = (url, token = "", errors = {}) => {
  const fetchApi = async (path, method = "GET", body = null, requestErrors = {}, requestRest = {}) => {
    let request = {
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    if (body) {
      request = { ...request, body: JSON.stringify(body) };
    }

    const response = await fetch(`${url}${path}`,  { ...request, ...requestRest });
    const json = await response.json();

    const { ok, status } = response;

    if (!ok) {
      const errorAction = requestErrors[status] ?? errors[status];

      if (isFunction(errorAction)) {
        errorAction();
      }

      throw new Error(json);
    }

    return json;
  };    

  const GET = (path, requestErrors, requestRest) => fetchApi(path, "GET", null, requestErrors, requestRest);

  const POST = (path, body, requestErrors, requestRest) => fetchApi(path, "POST", body, requestErrors, requestRest);

  const PUT = (path, body, requestErrors, requestRest) => fetchApi(path, "PUT", body, requestErrors, requestRest);

  const DELETE = (path, body, requestErrors, requestRest) => fetchApi(path, "DELETE", body, requestErrors, requestRest);

  return { fetchApi, GET, POST, PUT, DELETE };
};