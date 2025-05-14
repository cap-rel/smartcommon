import { createSlice } from "@reduxjs/toolkit";
import { formatDate, getLocalJSON, removeLocal, setLocalJSON } from "../../globals";

// TODO init

const initialState = {
    data: getLocalJSON("drafts") ?? []
};

function setNewDrafts(state, value) {
    state.data = value;
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
            state.data = [];
            removeLocal("drafts");
        },
        saveDraft(state, action) {
            const newDrafts = [...state.data, { updatedAt: formatDate(new Date), data: action.payload }];
            setNewDrafts(state, newDrafts);
        },
        removeDraft(state, action) {
            const newDrafts = state.data.filter((draft, DI) => DI === action.payload);
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