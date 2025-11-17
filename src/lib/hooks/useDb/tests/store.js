// store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";

import createIdbStorage from "redux-persist-indexeddb-storage";

import { rootReducer } from "./reducers";

// import fflateTransform from "./persistTransform"; // Compression transform

// import { DEVELOPMENT } from "utils/constants/generic.constants";
// import { REACT_INDEXED_DB, REACT_REDUX_PERSIST } from "utils/constants/auth.constants";

// Setup IndexedDB storage
const idbStorage = createIdbStorage("smart", {
  version: 1,
  storeName: "smart",
  description: "Redux Persist Store"
});

const persistConfig = {
  key: "root",
  storage: idbStorage,
  // transforms: [fflateTransform], // Apply compression
  whitelist: ["users", "interventions"]
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  // devTools: process.env.REACT_APP_NODE_ENV === DEVELOPMENT,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

const persistor = persistStore(store);

export { store, persistor };
