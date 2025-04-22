import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, removeLocal, setLocalJSON } from "../../globals";

// TODO init

const initialState = getLocalJSON("drafts") ?? null;

function setNewDrafts(state, value) {
    state = value;
    setLocalJSON("drafts", value);
};

const draftsSlice = createSlice({
    name: "drafts",
    initialState,
    reducers: {
        setDrafts(state, action) {
            const drafts = action.payload;
            setNewDrafts(state, drafts);
        },
        unsetDrafts(state) {
            state = null;
            removeLocal("drafts");
        },
        saveDraft(state, action) {
            const newDrafts = [...state, { updatedAt: formatDate(new Date), data: action.payload }];
            setNewDrafts(state, newDrafts);
        },
        removeDraft(state, action) {
            const newDrafts = state.filter((draft, DI) => DI === action.payload);
            setNewDrafts(state, newDrafts);
        },
        removeAllDrafts(state) {
            const newDrafts = [];
            setNewDrafts(state, newDrafts);
        },

    },
});

export default draftsSlice.reducer;
export const { 
    setDrafts,
    unsetDrafts,
    saveDraft,
    removeDraft,
    removeAllDrafts
} = draftsSlice.actions;

// set: 
    // - action
    // - validatedModifications