import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, removeLocal, setLocalJSON } from "../../globals";

const initialState = getLocalJSON("config") ?? null;

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
    setConfig(state, action) {
      const newConfig = action.payload;
      state = newConfig;
      setLocalJSON("config", newConfig);
    },
    unsetConfig(state) {
      state = null;
      removeLocal("config");
    }
  },
});

export default configSlice.reducer;
export const { setConfig, unsetConfig } = configSlice.actions;
