import { createSlice } from "@reduxjs/toolkit";
import { setSessionJSON } from "../../globals/functions/storage";

const initialState = {
  user: localStorage.getItem("user") || sessionStorage.getItem("user") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      if (action.payload.rememberMe) {
        localStorage.set("user", action.payload);
      } else {
        setSessionJSON("user", action.payload);
      }
    },
    logoutSuccess(state) {
      state.user = null;
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
    },
  },
});

export default authSlice.reducer;
export const { loginSuccess, logoutSuccess } = authSlice.actions;
