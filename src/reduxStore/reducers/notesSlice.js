import { createSlice } from "@reduxjs/toolkit";
import { getLocal, removeLocal, setLocal } from "../../globals/functions";
import { getSessionJSON } from "../../globals/functions/storage";

const initialState = {
  config: getSessionJSON("notesConfig"),
  notes: []
};

const configSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    refresh(state) {

    },
    update(state, action) {
        const newConfig = { ...state.config};
        if (action.payload.entity) {
            newConfig.entities[action.payload.entity] = action.payload.value;
        } else {
            newConfig[action.payload.mode] = action.payload.value;
        }
        setLocal("nocodeConfig", newConfig);
        state.config = newConfig;        
    },
    reset(state) {
        removeLocal("nocodeConfig");
        removeLocal("dolibarrEntities");
        state.config = { ...nocodeConfig};
    }
  },
});

export default configSlice.reducer;
export const { update, reset } = configSlice.actions;
