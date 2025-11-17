import { createSlice } from "@reduxjs/toolkit";
import { removeLocal, setLocal } from "../../export";

const tokenSlice = createSlice({
  name: "users",
  initialState: null,
  reducers: {
    setToken(state, action) {
      Object.assign(state, action.payload);
      setLocal("token", action.payload);
    },
    unsetToken(state) {
      Object.assign(state, null);
      removeLocal("token");
    },
  },
});

export const tokenReducer = tokenSlice.reducer;
export const { setToken, unsetToken } = tokenSlice.actions;
