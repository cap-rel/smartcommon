import { createSlice } from "@reduxjs/toolkit";

import { getLocal, getSession, removeLocal, removeSession, setLocal, setSession } from "lib/utils";

const userSlice = createSlice({
  name: "users",
  initialState: getLocal("user") ?? getSession("user") ?? {},
  reducers: {
    setUser(state, action) {
      const user = action.payload;

      Object.assign(state, user);

      if (user.rememberMe) {
        setLocal("user", user);
      } else {
        setSession("user", user);
      }
    },
    unsetUser(state) {
      Object.assign(state, null);

      removeLocal("user");
      removeSession("user");
    },
    saveConfig(state, action) {
      const config = action.payload;

      state.config = config;

      const user = { ...state };

      user.config = config
      
      if (user.rememberMe) {
        setLocal("user", user);
      } else {
        setSession("user", user);
      }
    }
  },
});

export const userReducer = userSlice.reducer;
export const { setUser, unsetUser, saveConfig } = userSlice.actions;
