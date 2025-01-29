import { createSlice } from "@reduxjs/toolkit";
import nocodeConfig from "../../../skels/Config";
import { getLocal, removeLocal, setLocal } from "../../globals/functions";

const initialState = {
  config: getLocal("nocodeConfig") || nocodeConfig
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {
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
