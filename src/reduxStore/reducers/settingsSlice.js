import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, setLocalJSON } from "../../globals/functions/storage";

const initialState = {
  language: getLocalJSON("language") || navigator.languages[0],
  // devise
  // système horraire
  //
  //
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    changeLanguage(state, action) {
      state.language = action.payload;
      setLocalJSON("language", action.payload);
    },
  },
});

export default settingsSlice.reducer;
export const { changeLanguage } = settingsSlice.actions;
