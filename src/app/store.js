import { configureStore } from "@reduxjs/toolkit";
import ocrReducer from "../states/ocr/ocrSlice";
import { ocrApiSlice } from "../states/ocr/ocrApiSlice";

export const store = configureStore({
  reducer: {
    orcFiles: ocrReducer,
    [ocrApiSlice.reducerPath]: ocrApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ocrApiSlice.middleware),
});
