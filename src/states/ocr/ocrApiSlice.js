import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../../constants/globalConstants";
import axios from "axios";

export const ocrApiSlice = createApi({
  reducerPath: "ocrApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL_API, credentials: "include" }),
  tagTypes: ["sources", "UploadedFiles"],
  endpoints: (builder) => ({
    // get uploaded files list =====================================
    getFilesSources: builder.query({
      query: () => "files/",
      providesTags: ["UploadedFiles"],
    }),

    // upload file =====================================
    // Upload avec progression
    saveFileSource: builder.mutation({
      async queryFn(
        { files, onProgress },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        try {
          const formData = new FormData();
          for (const f of files) formData.append("file", f);

          const response = await axios.post(
            `${BASE_URL_API}/files/`,
            formData,
            {
              headers: { "Content-Type": "multipart/form-data" },
              withCredentials: true,
              onUploadProgress: (event) => {
                const progress = Math.round((event.loaded * 100) / event.total);
                onProgress(progress);
              },
            }
          );

          return { data: response.data };
        } catch (error) {
          return {
            error: {
              status: error.response?.status,
              data: error.response?.data,
            },
          };
        }
      },
      invalidatesTags: ["UploadedFiles"],
    }),

    // Save one file =====================================
    saveOneFileSource: builder.mutation({
      query: (fileData) => ({
        url: "files/",
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: fileData,
      }),
      invalidatesTags: ["UploadedFiles"],
    }),

    // Extract data from file =====================================
    extractDataFromFile: builder.mutation({
      query: (fileData) => ({
        url: "files/extract",
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: fileData,
      }),
      invalidatesTags: ["UploadedFiles"],
    }),

    // Delete file =====================================
    deleteFile: builder.mutation({
      query: (fileId) => ({
        url: `files/${fileId}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["UploadedFiles"],
    }),
  }),
});

export const {
  useGetFilesSourcesQuery,
  useSaveFileSourceMutation,
  useDeleteFileMutation,
  useSaveOneFileSourceMutation,
  useExtractDataFromFileMutation,
} = ocrApiSlice;
