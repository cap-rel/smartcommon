import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: []
};

const interventionsSlice = createSlice({
  name: "interventions",
  initialState,
  reducers: {
    addIntervention(state, action) {
        state.data.push(action.payload);
    },
    deleteIntervention(state, action) {
        state.data = state.data.filter(intervention => intervention.id !== action.payload);
    }
  },
});

export default interventionsSlice.reducer;
export const { addIntervention, deleteIntervention } = interventionsSlice.actions;
