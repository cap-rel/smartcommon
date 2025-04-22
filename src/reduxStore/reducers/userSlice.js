import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, removeLocal, removeSession, setLocalJSON, setSessionJSON } from "../../globals/functions/storage";

const initialState = getLocalJSON("user") || getSessionJSON("user") || null

const useSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      const user = action.payload;
      state = user;
      if (action.payload.rememberMe) {
        setLocalJSON("user", user);
      } else {
        setSessionJSON("user", user);
      }
    },
    unsetUser(state) {
      state = null;
      removeLocal("user");
      removeSession("user");
    },
  },
});

export default useSlice.reducer;
export const { setUser, unsetUser } = useSlice.actions;
