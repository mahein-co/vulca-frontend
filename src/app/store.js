import { configureStore } from "@reduxjs/toolkit";
import ocrReducer from "../states/ocr/ocrSlice";
import navigationsReducer from "../states/navigations/navigationsSlice";
import chatReducer from "../states/chat/chatSlice";
import userReducer from "../states/user/userSlice";
import { ocrApiSlice } from "../states/ocr/ocrApiSlice";
import { journalApiSlice } from "../states/journal/journalApiSlice";
import { comptaApiSlice } from "../states/compta/comptaApiSlice";
import { userApiSlice } from "../states/user/userApiSlice";

export const store = configureStore({
  reducer: {
    orcFiles: ocrReducer,
    navigations: navigationsReducer,
    chatbot: chatReducer,
    user: userReducer,
    [ocrApiSlice.reducerPath]: ocrApiSlice.reducer,
    [journalApiSlice.reducerPath]: journalApiSlice.reducer,
    [comptaApiSlice.reducerPath]: comptaApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(journalApiSlice.middleware)
      .concat(ocrApiSlice.middleware)
      .concat(comptaApiSlice.middleware)
      .concat(userApiSlice.middleware),
});
