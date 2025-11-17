import { userReducer, tokenReducer } from "./slices";

export const reducers = {
  user: userReducer,
  // token: tokenReducer,
};

export * from "./slices";