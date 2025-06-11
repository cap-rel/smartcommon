import { isFunction, isNil } from "../../globals";

export const useApi = (url, token = "", errors = {}) => {
  const fetchApi = async (path, method = "GET", body = "") => {
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

    const response = await fetch(`${url}${path}`, request);
    const json = await response.json();

    const { ok, status } = response;

    if (!ok) {
      const errorAction = errors[status];

      if (isFunction(errorAction)) {
        errorAction();
      }

      throw new Error(json);
    }

    return json;
  };    

  const GET = (path) => fetchApi(path);

  const POST = (path, body) => fetchApi(path, "POST", body);

  const PUT = (path, body) => fetchApi(path, "PUT", body);

  const DELETE = (path, body) => fetchApi(path, "DELETE", body);

  return { fetchApi, GET, POST, PUT, DELETE };
};