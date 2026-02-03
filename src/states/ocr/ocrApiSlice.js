import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithHeaders } from "../apiConfig";
import { BASE_URL_API } from "../../constants/globalConstants";
import axios from "axios";

export const ocrApiSlice = createApi({
  reducerPath: "ocrApi",
  baseQuery: baseQueryWithHeaders,
  tagTypes: ["pieces", "UploadedFiles"],
  endpoints: (builder) => ({
    // ✅ MULTI-TENANT: project_id enables cache isolation per project
    // get uploaded files list =====================================
    getFilesSources: builder.query({
      query: (project_id) => `files/?project_id=${project_id}`,
      providesTags: (result, error, project_id) => [
        { type: 'UploadedFiles', id: project_id },
      ],
    }),

    // upload file =====================================
    // Upload avec progression
    saveFileSource: builder.mutation({
      async queryFn(
        { files, onProgress, project_id },
        _queryApi,
        _extraOptions,
        baseQuery
      ) {
        try {
          const formData = new FormData();
          for (const f of files) formData.append("file", f);

          const headers = { "Content-Type": "multipart/form-data" };
          const projectId = project_id || localStorage.getItem("selectedProjectId");
          if (projectId) headers["X-Project-ID"] = projectId;

          const response = await axios.post(
            `${BASE_URL_API}/files/`,
            formData,
            {
              headers: headers,
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
      invalidatesTags: (result, error, { project_id }) => [
        { type: 'UploadedFiles', id: project_id || localStorage.getItem("selectedProjectId") },
      ],
    }),

    // Save one file =====================================
    saveOneFileSource: builder.mutation({
      query: (arg) => {
        const body = arg instanceof FormData ? arg : arg.fileData;
        return {
          url: "files/",
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const project_id = (arg instanceof FormData) ? null : arg.project_id;
        return [
          { type: 'UploadedFiles', id: project_id || localStorage.getItem("selectedProjectId") },
        ];
      },
    }),

    // Save piece compta by formular =====================================
    savePieceByFormular: builder.mutation({
      query: ({ data, project_id }) => ({
        url: "pieces/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: 'pieces', id: project_id || localStorage.getItem("selectedProjectId") },
      ],
    }),

    // Extract data from file =====================================
    extractDataFromFile: builder.mutation({
      query: (arg) => {
        const body = arg instanceof FormData ? arg : arg.fileData;
        return {
          url: "files/extract",
          method: "POST",
          body,
        };
      },
      invalidatesTags: (result, error, arg) => {
        const project_id = (arg instanceof FormData) ? null : arg.project_id;
        return [
          { type: 'UploadedFiles', id: project_id || localStorage.getItem("selectedProjectId") },
        ];
      },
    }),

    // Delete file =====================================
    deleteFile: builder.mutation({
      query: ({ fileId, project_id }) => ({
        url: `files/${fileId}/`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { project_id }) => [
        { type: 'UploadedFiles', id: project_id || localStorage.getItem("selectedProjectId") },
      ],
    }),
  }),
});

export const {
  useGetFilesSourcesQuery,
  useSaveFileSourceMutation,
  useDeleteFileMutation,
  useSaveOneFileSourceMutation,
  useExtractDataFromFileMutation,
  useSavePieceByFormularMutation,
} = ocrApiSlice;
