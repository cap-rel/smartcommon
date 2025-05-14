import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, removeLocal, removeSession, setLocalJSON, setSessionJSON } from "../../globals/functions/storage";

const initialState = {
  data: {
    auth: getLocalJSON("auth") ?? getSessionJSON("auth") ?? null,
    isTokenChecked: getSessionJSON("isTokenChecked") ?? false
  }
};

const sessionSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAuth(state, action) {
      const auth = action.payload;
      state.data.auth = auth;
      // if (action.payload.rememberMe) {
      setLocalJSON("auth", auth);
      // } else {
        // setSessionJSON("auth", auth);
      // }
    },
    unsetAuth(state) {
      state.data.auth = null;
      removeLocal("auth");
      removeSession("auth");
    },
    setIsTokenChecked(state, action) {
      const isTokenChecked = action.payload;
      state.data.isTokenChecked = action.payload
      setSessionJSON("isTokenChecked", isTokenChecked);
    },
    unsetIsTokenChecked(state) {
      state.data.isTokenChecked = false;
      removeSession("isTokenChecked");
    }
  },
});

export default sessionSlice.reducer;
export const { setAuth, unsetAuth, setIsTokenChecked, unsetIsTokenChecked } = sessionSlice.actions;
