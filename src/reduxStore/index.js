import authReducer from "./reducers/authSlice";
import settingsReducer from "./reducers/settingsSlice";
import configReducer from "./reducers/configSlice";

import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
});

const store = configureStore({ reducer: rootReducer });

export { store };