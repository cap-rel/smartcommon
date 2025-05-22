import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, removeLocal, removeSession, setLocalJSON, setSessionJSON } from "../../globals/functions/storage";

const initialState = {
  data: getLocalJSON("session") ?? getSessionJSON("session") ?? null,
};

const sessionSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSession(state, action) {
      const session = action.payload;
      state.data = session;
      if (session.rememberMe) {
        setLocalJSON("session", session);
      } else {
        setSessionJSON("session", session);
      }
    },
    unsetSession(state) {
      state.data = null;
      removeLocal("session");
      removeSession("session");
    }
  },
});

export default sessionSlice.reducer;
export const { setSession, unsetSession } = sessionSlice.actions;
