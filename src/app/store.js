import { configureStore } from "@reduxjs/toolkit";
import ocrReducer from "../states/ocr/ocrSlice";
import navigationsReducer from "../states/navigations/navigationsSlice";
import { ocrApiSlice } from "../states/ocr/ocrApiSlice";

export const store = configureStore({
  reducer: {
    orcFiles: ocrReducer,
    navigations: navigationsReducer,
    [ocrApiSlice.reducerPath]: ocrApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(ocrApiSlice.middleware),
});
