import settingsReducer from "./reducers/settingsSlice";
import authReducer from "./reducers/authSlice";

import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
});

export const store = configureStore({ reducer: rootReducer });