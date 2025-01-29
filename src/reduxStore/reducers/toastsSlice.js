import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
  index: 1,
};

const toastsSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    toast(state, action) {
      state.list = [...state.list, { ...action.payload, id: state.index }];
      state.index++
    },
    // removeLastToast(state) {
    //   state.list.splice(state.list[state.list.length - 1], 1);
    // },
    removeToast(state, action) {
      const toastIndex = state.list.findIndex((toast) => {
        return toast.id == action.payload;
      })
      state.list.splice(toastIndex, 1);      
    },
    removeAllToasts(state) {
      state.list = [];
    },
  },
});

export default toastsSlice.reducer;
export const { toast, removeLastToast, removeToast, removeAllToasts } = toastsSlice.actions;
