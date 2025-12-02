import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isChatModalOpen: false,
};

export const chatSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    // OPEN CHAT MODAL
    actionOpenChat: (state) => {
      return {
        ...state,
        isChatModalOpen: true,
      };
    },
    // CLOSE CHAT MODAL
    actionCloseChat: (state) => {
      return {
        ...state,
        isChatModalOpen: false,
      };
    },
  },
});

export const { actionCloseChat, actionOpenChat } = chatSlice.actions;
export default chatSlice.reducer;
