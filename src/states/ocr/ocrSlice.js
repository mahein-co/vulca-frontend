import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uploadedFiles: [],
  fileType: "tableau",
};

export const ocrSlice = createSlice({
  name: "ocr",
  initialState,
  reducers: {
    // Add uploaded files to the state
    actionAddUploadedFiles: (state, action) => {
      return {
        ...state,
        uploadedFiles: [
          ...state.uploadedFiles,
          ...action.payload.uploadedFiles,
        ],
        fileType: action.payload.fileType,
      };
    },

    // Remove file by index
    actionRemoveFileByIndex: (state, action) => {
      const indexToRemove = action.payload;
      state.uploadedFiles = state.uploadedFiles.filter(
        (_, index) => index !== indexToRemove
      );
    },

    // Clear uploaded files from the state
    actionClearUploadedFiles: (state) => {
      return {
        ...state,
        uploadedFiles: [],
      };
    },
  },
});

export const {
  actionAddUploadedFiles,
  actionClearUploadedFiles,
  actionRemoveFileByIndex,
} = ocrSlice.actions;
export default ocrSlice.reducer;
