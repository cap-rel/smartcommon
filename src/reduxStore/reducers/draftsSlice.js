import { createSlice } from "@reduxjs/toolkit";
import { formatDate, getLocalJSON, getSessionJSON, isNil, isUndefined, removeLocal, setLocalJSON } from "../../globals";

// TODO init

const setNewDrafts = (user, newDrafts) => {
    const drafts = getLocalJSON("drafts") ?? {};
    setLocalJSON("drafts", { ...drafts, [user]: newDrafts});
};

const { user } = getLocalJSON("session") ?? getSessionJSON("session") ?? {};

const setDefaultDrafts = () => { // In case of deleted drafts
    setNewDrafts(user, []);
    return [];
};

const initialState = {
  data: !isNil(user) ? (getLocalJSON("drafts")?.[user] ?? setDefaultDrafts()) : null
};

const draftsSlice = createSlice({
    name: "drafts",
    initialState,
    reducers: {
        setDrafts(state, action) {
            const user = action.payload;
            if (isUndefined(getLocalJSON("drafts"))) {
                setLocalJSON("drafts", {});
            }

            let drafts = [];
        
            const userDrafts = getLocalJSON("drafts")[user];

            if (isUndefined(userDrafts)) {
                setNewDrafts(user, drafts);
            } else {
                drafts = userDrafts;
            }

            state.data = drafts;
        },
        unsetDrafts(state) {
            state.data = null;
        },

        saveDraft(state, action) {
            const { user, index = null, draft } = action.payload;

            let newDrafts = [...state.data];

            const updatedAt = formatDate(new Date, "seconds-timestamp");

            if (isNil(index)) {
                newDrafts = [...newDrafts, { updatedAt, data: draft }]
            } else {
                newDrafts[index] = { ...newDrafts[index], updatedAt, data: draft };
            }

            state.data = newDrafts;
            setNewDrafts(user, newDrafts);
        },

        removeAllInterventionDrafts(state, action) {
            const { user, id } = action.payload;

            const newDrafts = [ ...state.data].filter(draft => index !== DI);

            state.data = newDrafts;
            setNewDrafts(user, newDrafts);
        },

    },
});

export default draftsSlice.reducer;
export const { setDrafts, unsetDrafts, saveDraft, removeAllInterventionDrafts } = draftsSlice.actions;

export const unsetUserDrafts = (user) => {
    const drafts = getLocalJSON("drafts");
    delete drafts[user];
    setLocalJSON("drafts", drafts);
};
  