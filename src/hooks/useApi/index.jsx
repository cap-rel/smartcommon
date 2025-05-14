import { useDispatch } from "react-redux";
import { unsetAuth } from "../../reduxStore/reducers/sessionSlice";
// import { API_URL } from "../../globals/constants";
import { useTranslation } from "react-i18next";
import { useStates } from "../../hooks";

export const useApi = (url, token = "") => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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

    return await fetch(`${url}${path}`, request).then(response => {
      if (!response.ok) {
        if (response.status == 401) {
          dispatch(unsetAuth());
        }

        return response.json().then((json) => {
          throw new Error(json);
        });
      }
      return response.json();
    });
  };

  // const login = (body) => {
  //   set("isLoggingIn", true);
  //   fetchApi("/login", "POST", body)
  //   .then((json) => {
  //     set("isLoggingIn", false);
  //     dispatch(loginSuccess(json.data));
  //     toast.success(t("public.loginSuccess", { user: json.data.user }), { duration: 8000, name: "👋" });
  //   })
  //   .catch((error) => {
  //     set("isLoggingIn", false);
  //     console.error(error.message);
  //     toast.error(t("public.loginError"));
  //   });
  // }

  // const logout = (body) => {
  //   set("isLoggingOut", true);
  //   fetchApi("/logout", "POST")
  //   .then(() => {
  //     set("isLoggingOut", false);
  //     dispatch(logoutSuccess());
  //   })
  //   .catch((error) => {
  //     set("isLoggingOut", false);
  //     console.error(error.message);
  //     toast.error(t("public.logoutError"));
  //   });
  // }

  const GET = (path) => fetchApi(path);

  const POST = (path, body) => fetchApi(path, "POST", body);

  const PUT = (path, body) => fetchApi(path, "PUT", body);

  const DELETE = (path, body) => fetchApi(path, "DELETE", body);

  return { fetchApi, GET, POST, PUT, DELETE };
};