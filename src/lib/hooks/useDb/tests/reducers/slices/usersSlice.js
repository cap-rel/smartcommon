import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: []
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser(state, action) {
        state.data.push(action.payload);
    },
    deleteUser(state, action) {
        state.data = state.data.filter(user => user.id != action.payload);
    }
  },
});

export default usersSlice.reducer;
export const { addUser, deleteUser } = usersSlice.actions;