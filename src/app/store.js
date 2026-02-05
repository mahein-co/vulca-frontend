import { configureStore } from "@reduxjs/toolkit";
import ocrReducer from "../states/ocr/ocrSlice";
import navigationsReducer from "../states/navigations/navigationsSlice";
import chatReducer from "../states/chat/chatSlice";
import userReducer from "../states/user/userSlice";
import dashboardFilterReducer from "../states/dashboard/dashboardFilterSlice";
import { ocrApiSlice } from "../states/ocr/ocrApiSlice";
import { journalApiSlice } from "../states/journal/journalApiSlice";
import { comptaApiSlice } from "../states/compta/comptaApiSlice";
import { userApiSlice } from "../states/user/userApiSlice";
import { projectApiSlice } from "../states/project/projectApiSlice";

import { chatbotApiSlice } from "../states/chat/chatbotApiSlice";

export const store = configureStore({
  reducer: {
    orcFiles: ocrReducer,
    navigations: navigationsReducer,
    chatbot: chatReducer,
    user: userReducer,
    dashboardFilter: dashboardFilterReducer,
    [ocrApiSlice.reducerPath]: ocrApiSlice.reducer,
    [journalApiSlice.reducerPath]: journalApiSlice.reducer,
    [comptaApiSlice.reducerPath]: comptaApiSlice.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [projectApiSlice.reducerPath]: projectApiSlice.reducer,
    [chatbotApiSlice.reducerPath]: chatbotApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(journalApiSlice.middleware)
      .concat(ocrApiSlice.middleware)
      .concat(comptaApiSlice.middleware)
      .concat(userApiSlice.middleware)
      .concat(projectApiSlice.middleware)
      .concat(chatbotApiSlice.middleware),
});
