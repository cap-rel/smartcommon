import { createSlice } from "@reduxjs/toolkit";

import { getLocal, getSession, removeLocal, removeSession, setLocal, setSession } from "lib/utils";

const userSlice = createSlice({
  name: "users",
  initialState: getLocal("user") ?? getSession("user") ?? {},
  reducers: {
    setUser(state, action) {
      const user = action.payload;

      if (user.rememberMe) {
        setLocal("user", user);
      } else {
        setSession("user", user);
      }

      return user;
    },
    unsetUser(state) {
      removeLocal("user");
      removeSession("user");

      return {};
    },
    updateUser(state, action) {
      const update = action.payload;

      const newUser = { ...state, ...update };

      if (newUser.rememberMe) {
        setLocal("user", newUser);
      } else {
        setSession("user", newUser);
      }

      return newUser;
      
    }
  },
});

export const userReducer = userSlice.reducer;
export const { setUser, unsetUser, updateUser } = userSlice.actions;
