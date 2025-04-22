import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, removeLocal, setLocalJSON } from "../../globals";

// TODO init

const initialState = getLocalJSON("updates") ?? null;

function setNewUpdates(state, value) {
    state = value;
    setLocalJSON("updates", value);
};

const updatesSlice = createSlice({
    name: "updates",
    initialState,
    reducers: {
        setUpdates(state, action) {
            const updates = action.payload;
            setNewUpdates(state, updates);
        },
        unsetUpdates(state) {
            state = null;
            removeLocal("updates");
        },
        saveUpdate(state, action) {
            const newUpdates = [...state, { updatedAt: formatDate(new Date), data: action.payload }];
            setNewUpdates(state, newUpdates);
        },
        removeUpdate(state, action) {
            const newUpdates = state.filter((update, UI) => UI === action.payload);
            setNewUpdates(state, newUpdates);
        },
        removeAllUpdates(state) {
            const newUpdates = [];
            setNewUpdates(state, newUpdates);
        },

    },
});

export default updatesSlice.reducer;
export const { 
    setUpdates,
    unsetUpdates,
    saveUpdate,
    removeUpdate,
    removeAllUpdates
} = updatesSlice.actions;

// set: 
    // - action
    // - validatedModifications