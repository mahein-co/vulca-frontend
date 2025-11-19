import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePageTitle: "Vulca Menabe",
};

export const navigationsSlice = createSlice({
  name: "navigations",
  initialState,
  reducers: {
    // Set active page title
    actionSetActivePageTitle: (state, action) => {
      state.activePageTitle = action.payload;
    },
  },
});

export const { actionSetActivePageTitle } = navigationsSlice.actions;
export default navigationsSlice.reducer;
