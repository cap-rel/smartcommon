import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, removeLocal, removeSession, setLocalJSON, setSessionJSON } from "../../globals/functions/storage";

const initialState = {
  user: getLocalJSON("user") || getSessionJSON("user") || null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.user = action.payload;
      if (action.payload.rememberMe) {
        setLocalJSON("user", action.payload);
      } else {
        setSessionJSON("user", action.payload);
      }
    },
    logoutSuccess(state) {
      state.user = null;
      removeLocal("user");
      removeSession("user");
    },
  },
});

export default authSlice.reducer;
export const { loginSuccess, logoutSuccess } = authSlice.actions;
