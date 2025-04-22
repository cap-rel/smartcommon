import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, removeLocal, setLocalJSON } from "../../globals/functions/storage";

const initialState = getLocalJSON("settings") ?? {

};
  // language: getLocalJSON("language") || navigator.languages[0],
  // devise
  // système horraire
  //
  //

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings(state, action) {
      const settings = action.payload;
      state = settings;
      setLocalJSON("settings", settings);
    },
    unsetSettings(state) {
      state = null;
      removeLocal("settings")
    },
    changeLanguage(state, action) {
      state.language = action.payload;
      setLocalJSON("language", action.payload);
    },
  },
});

export default settingsSlice.reducer;
export const { setSettings, unsetSettings, changeLanguage } = settingsSlice.actions;
