import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, getSessionJSON, isNil, isUndefined, removeLocal, setLocalJSON } from "../../globals";

const setNewUpdates = (user, newUpdates) => {
    const updates = getLocalJSON("updates") ?? {};
    setLocalJSON("updates", { ...updates, [user]: newUpdates});
};

const { user } = getLocalJSON("session") ?? getSessionJSON("session") ?? {};

const setDefaultUpdates = () => { // In case of deleted updates
    setNewUpdates(user, []);
    return [];
};

const initialState = {
  data: !isNil(user) ? (getLocalJSON("updates")?.[user] ?? setDefaultUpdates()) : null
};


const updatesSlice = createSlice({
    name: "updates",
    initialState,
    reducers: {
        setUpdates(state, action) {
            const user = action.payload;
            if (isUndefined(getLocalJSON("updates"))) {
                setLocalJSON("updates", {});
            }

            let updates = [];
        
            const userUpdates = getLocalJSON("updates")[user];

            if (isUndefined(userUpdates)) {
                setNewUpdates(user, updates);
            } else {
                updates = userUpdates;
            }

            state.data = updates;
        },
        unsetUpdates(state) {
            state.data = null;
        },

        saveUpdate(state) {
            const { user, update } = action.payload;

            const newUpdates = [...state.data];

            newUpdates = [...newUpdates, { updatedAt: formatDate(new Date, "seconds-timestamp"), data: update }]

            state.data = newUpdates;
            setNewUpdates(user, newUpdates);
        },

        removeUpdate(state, action) {
            const { user, index } = action.payload;

            const newUpdates = [ ...state.data].filter((update, UI) => index !== UI);

            state.data = newUpdates;
            setNewUpdates(user, newUpdates);
        },

    },
});

export default updatesSlice.reducer;
export const { setUpdates, unsetUpdates, saveUpdate, removeUpdate } = updatesSlice.actions;