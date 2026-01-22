import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL_API } from "../../constants/globalConstants";

export const chatbotApiSlice = createApi({
    reducerPath: "chatbotApi",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL_API,
        credentials: "include"
    }),
    tagTypes: ["ChatHistory", "ChatMessage"],
    endpoints: (builder) => ({
        getHistories: builder.query({
            query: () => "histories/",
            providesTags: ["ChatHistory"],
        }),
        createHistory: builder.mutation({
            query: (data) => ({
                url: "new-chat/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ChatHistory"],
        }),
        getMessages: builder.query({
            query: (historyId) => `messages-history/${historyId}/`,
            providesTags: ["ChatMessage"],
        }),
        sendMessage: builder.mutation({
            query: (data) => ({
                url: "messages/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ChatMessage"],
        }),
        renameHistory: builder.mutation({
            query: ({ historyId, title }) => ({
                url: `messages-history/${historyId}/rename/`,
                method: "PATCH",
                body: { title },
            }),
            invalidatesTags: ["ChatHistory"],
        }),
        deleteHistory: builder.mutation({
            query: (historyId) => ({
                url: `messages-history/${historyId}/delete/`,
                method: "DELETE",
            }),
            invalidatesTags: ["ChatHistory"],
        }),
    }),
});

export const {
    useGetHistoriesQuery,
    useCreateHistoryMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useRenameHistoryMutation,
    useDeleteHistoryMutation,
} = chatbotApiSlice;
