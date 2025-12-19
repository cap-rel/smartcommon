import { isFunction } from "lodash";

import { useLibConfig } from "lib/hooks";

export const useApiTest = (props) => {
  let { url } = props;
  const {  token = "", errors = {} } = props;

  const { api } = useLibConfig() ?? {};

  url = url ?? api?.url;

  const fetchApi = async (path, method = "GET", body, requestRest = {}, requestErrors = {}) => {
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

  const GET = (path, requestRest, requestErrors) => fetchApi(path, "GET", null, requestRest, requestErrors);

  const POST = (path, body, requestRest, requestErrors) => fetchApi(path, "POST", body, requestRest, requestErrors);

  const PUT = (path, body, requestRest, requestErrors) => fetchApi(path, "PUT", body, requestRest, requestErrors);

  const DELETE = (path, body, requestRest, requestErrors) => fetchApi(path, "DELETE", body, requestRest, requestErrors);

  return { fetchApi, GET, POST, PUT, DELETE };
};