import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  language: localStorage.getItem("language") || navigator.languages[0],
  isSidebarOpened: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    changeLanguage(state, action) {
      state.language = action.payload;
      localStorage.setItem("language", action.payload);
    },
    setIsSidebarOpened(state) {
      state.isSidebarOpened = !state.isSidebarOpened;
    }
  },
});

export default settingsSlice.reducer;
export const { changeLanguage, setIsSidebarOpened } = settingsSlice.actions;
