import authReducer from "./reducers/authSlice";
import settingsReducer from "./reducers/settingsSlice";
import configReducer from "./reducers/configSlice";

import { combineReducers } from "redux";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";

// import storage from "redux-persist/lib/storage";
import sessionStorage from "redux-persist/lib/storage/session";

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  config: configReducer,
});

// const persistConfig = {
//   key: "root",
//   storage: sessionStorage
// }

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: rootReducer,
  // reducer: persistedReducer,
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware({
  //   serializableCheck: false // provide from getting any errors
  // })
});

// const persistor = persistStore(store)

export { store }; // persistor