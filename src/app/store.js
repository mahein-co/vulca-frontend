import { configureStore } from "@reduxjs/toolkit";
import ocrReducer from "../states/ocr/ocrSlice";
import navigationsReducer from "../states/navigations/navigationsSlice";
import chatReducer from "../states/chat/chatSlice";
import { ocrApiSlice } from "../states/ocr/ocrApiSlice";
import { journalApiSlice } from "../states/journal/journalApiSlice";

export const store = configureStore({
  reducer: {
    orcFiles: ocrReducer,
    navigations: navigationsReducer,
    chatbot: chatReducer,
    [ocrApiSlice.reducerPath]: ocrApiSlice.reducer,
    [journalApiSlice.reducerPath]: journalApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(journalApiSlice.middleware)
      .concat(ocrApiSlice.middleware),
});
