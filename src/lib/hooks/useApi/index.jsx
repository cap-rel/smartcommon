import { isFunction } from "../../utils";
import { useLib } from "../useLib";

export const useApi = (props) => {
  let { url, token = "", errors = {} } = props;

  const { config } = useLib() ?? {};

  url = url ?? config?.api?.url;

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