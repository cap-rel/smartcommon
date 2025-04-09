import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, logoutSuccess } from "../../reduxStore/reducers/authSlice";
// import { API_URL } from "../../globals/constants";
import { useTranslation } from "react-i18next";
import { useStates } from "../../hooks";

export const useApi = (API_URL) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector(state => state.auth.user);

  const { states, set } = useStates({
    isLoggingIn: false,
    isLoggingOut: false
  });

  const fetchApi = async (path, method = "GET", body = "") => {
    let request = {
      method: method,
      headers: {
        Authorization: `Bearer ${user ? user.token : ""}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    if (body) {
      request = { ...request, body: JSON.stringify(body) };
    }

    return await fetch(`${API_URL}${path}`, request).then(response => {
      if (!response.ok) {
        if (response.status == 403 || response.status == 401) {
          dispatch(logoutSuccess());
        }
        return response.json().then((json) => {
          throw new Error(json);
        });
      }
      return response.json();
    });
  };

  const login = (body) => {
    set("isLoggingIn", true);
    fetchApi("/login", "POST", body)
    .then((json) => {
      set("isLoggingIn", false);
      dispatch(loginSuccess(json.data));
      toast.success(t("public.loginSuccess", { user: json.data.user }), { duration: 8000, name: "👋" });
    })
    .catch((error) => {
      set("isLoggingIn", false);
      console.error(error.message);
      toast.error(t("public.loginError"));
    });
  }

  const logout = (body) => {
    set("isLoggingOut", true);
    fetchApi("/logout", "POST")
    .then(() => {
      set("isLoggingOut", false);
      dispatch(logoutSuccess());
    })
    .catch((error) => {
      set("isLoggingOut", false);
      console.error(error.message);
      toast.error(t("public.logoutError"));
    });
  }

  const GET = (path) => fetchApi(path);

  const POST = (path, body) => fetchApi(path, "POST", body);

  const PUT = (path, body) => fetchApi(path, "PUT", body);

  const DELETE = (path, body) => fetchApi(path, "DELETE", body);

  return { fetchApi, login, logout, GET, POST, PUT, DELETE, states };
};