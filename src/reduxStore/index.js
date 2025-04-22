import settingsReducer from "./reducers/settingsSlice";
import authReducer from "./reducers/userSlice";
import configReducer from "./reducers/configSlice";
import draftsReducer from "./reducers/draftsSlice";
import updatesReducer from "./reducers/draftsSlice";
import interventionsReducer from "./reducers/interventionsSlice";

import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  config: configReducer,
  updates: updatesReducer,
  drafts: draftsReducer,
  interventions: interventionsReducer
});

export const store = configureStore({ reducer: rootReducer });