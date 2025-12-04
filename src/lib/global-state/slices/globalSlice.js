import { createSlice } from "@reduxjs/toolkit";

import { getLocal, getSession, removeLocal, removeSession, setLocal, setSession } from "lib/utils";

// do the initial system

const globalSlice = createSlice({
  name: "global",
  initialState: {},
  reducers: {
    setGlobalStates(state, action) {
      state = action.payload;
    },
  },
});

export const globalReducer = globalSlice.reducer;
export const { setGlobalStates } = globalSlice.actions;