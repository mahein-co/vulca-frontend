import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../../constants/globalConstants";

export const journalApiSlice = createApi({
  reducerPath: "journalApi",
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL_API, credentials: "include" }),
  tagTypes: ["journal", "journals"],
  endpoints: (builder) => ({
    // Get journal list =====================================
    getJournals: builder.query({
      query: () => "journals/",
      providesTags: ["journals"],
    }),

    // Generate journal =====================================
    generateJournal: builder.mutation({
      query: (data) => ({
        url: "journals/generate/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: data,
      }),
      invalidatesTags: ["journals"],
    }),
  }),
});

export const { useGenerateJournalMutation, useGetJournalsQuery } =
  journalApiSlice;
