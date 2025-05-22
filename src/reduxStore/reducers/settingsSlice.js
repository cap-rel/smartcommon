import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, removeLocal, setLocalJSON } from "../../globals/functions/storage";
import { isNil, isUndefined } from "../../globals";

export const defaultSettings = {
  lang: !isUndefined(navigator) ? (navigator.language || navigator.userLanguage).split("-")[0] : "fr",
  country: "FR",
  theme: "SmartInterventions",
  darkMode: !isUndefined(window) ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
  scale: 100,
  calendarModeByDefault: false,
  interventionsFilterByDefault: "today", // week or month
  deleteDraftWhenDone: true,
};

const setNewSettings = (user, newSettings) => {
  const settings = getLocalJSON("settings") ?? {};
  setLocalJSON("settings", { ...settings, [user]: newSettings });
};

const { user } = getLocalJSON("session") ?? getSessionJSON("session") ?? {};

const setDefaultSettings = () => { // In case of deleted settings
  setNewSettings(user, defaultSettings);
  return defaultSettings;
};

const initialState = {
  data: !isNil(user) ? (getLocalJSON("settings")?.[user] ?? setDefaultSettings()) : null 
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setSettings(state, action) {
      const user = action.payload;
      if (isUndefined(getLocalJSON("settings"))) {
        setLocalJSON("settings", {});
      }

      let settings = defaultSettings;

      const userSettings = getLocalJSON("settings")[user];

      if (isUndefined(userSettings)) {
        setNewSettings(user, settings);
      } else {
        settings = userSettings;
      }

      state.data = settings;
    },
    unsetSettings(state) {
      state.data = null;
    },
    changeAllSettings(state, action) {
      const { user, settings = defaultSettings } = action.payload;
      state.data = settings;
      setNewSettings(user, settings);
    },
    changeSetting(state, action) {
      const { user, setting, value } = action.payload;
      const settings = { ...state.data, [setting]: value };
      state.data = settings;
      setNewSettings(user, settings);
    }
  },
});

export default settingsSlice.reducer;
export const { setSettings, unsetSettings, changeSetting, changeAllSettings } = settingsSlice.actions;

export const unsetUserSettings = (user) => {
  const settings = getLocalJSON("settings");
  delete settings[user];
  setLocalJSON("settings", settings);
};
