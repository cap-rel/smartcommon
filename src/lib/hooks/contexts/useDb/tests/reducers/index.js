import usersReducer from "./slices/usersSlice";
import interventionsReducer from "./slices/interventionsSlice";

import { combineReducers } from "redux";

export const rootReducer = combineReducers({
  users: usersReducer,
  interventions: interventionsReducer,
});