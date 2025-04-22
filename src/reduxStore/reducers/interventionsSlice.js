import { createSlice } from "@reduxjs/toolkit";
import { getLocalJSON, removeLocal, setLocalJSON } from "../../globals";

// TODO init

const initialState = getLocalJSON("interventions") ?? null;

function setNewInterventions(state, value) {
    state = value;
    setLocalJSON("interventions", value);
}

const interventionsSlice = createSlice({
    name: "interventions",
    initialState,
    reducers: {
        setInterventions(state, action) {
            const interventions = action.payload;
            setNewInterventions(state, interventions);
        },
        unsetInterventions(state) {
            state = null;
            removeLocal("interventions");
        },
        setInterventionsFromType(state, action) {
            const { type, interventions } = action.payload;
            const newInterventions = { ...state, [type]: interventions };
            setNewInterventions(state, newInterventions);
        },
        setMyInterventions(state, action) {
            const myInterventions = { ...state, mine: action.payload };
            setNewInterventions(state, myInterventions);
        },
        setUrgentInterventions(state, action) {
            const urgentInterventions = { ...state, urgent: action.payload };
            setNewInterventions(state, urgentInterventions);
        },
        setUnassignedInterventions(state, action) {
            const unassignedInterventions = { ...state, unassigned: action.payload };
            setNewInterventions(state, unassignedInterventions);
        }
    },
});

export default interventionsSlice.reducer;
export const { 
    setInterventions,
    unsetInterventions,
    setInterventionsFromType,
    setMyInterventions,
    setUrgentInterventions,
    setUnassignedInterventions
} = interventionsSlice.actions;