import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithHeaders } from "../apiConfig";

export const journalApiSlice = createApi({
  reducerPath: "journalApi",
  baseQuery: baseQueryWithHeaders,
  tagTypes: ["journal", "journals"],
  endpoints: (builder) => ({
    // Get journal list =====================================
    // ✅ IMPORTANT: project_id parameter enables RTK Query cache invalidation
    getJournals: builder.query({
      query: (project_id) => {
        // project_id is automatically sent via X-Project-ID header in baseQueryWithHeaders
        // But we need it as a parameter for RTK Query to track cache per project
        return `journals/?project_id=${project_id}`;
      },
      providesTags: (result, error, project_id) => [
        { type: 'journals', id: project_id },
      ],
    }),

    // Generate journal =====================================
    generateJournal: builder.mutation({
      query: (data) => ({
        url: "journals/generate/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      }),
      invalidatesTags: (result, error, data) => [
        { type: 'journals', id: data.project_id || localStorage.getItem('selectedProjectId') },
      ],
    }),
  }),
});

export const { useGenerateJournalMutation, useGetJournalsQuery } =
  journalApiSlice;
