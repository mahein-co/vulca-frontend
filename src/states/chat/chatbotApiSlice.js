import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithHeaders } from "../apiConfig";

export const chatbotApiSlice = createApi({
    reducerPath: "chatbotApi",
    baseQuery: baseQueryWithHeaders,
    tagTypes: ["ChatHistory", "ChatMessage"],
    endpoints: (builder) => ({
        // ✅ MULTI-TENANT: project_id enables cache isolation per project
        getHistories: builder.query({
            query: (project_id) => `histories/?project_id=${project_id}`,
            providesTags: (result, error, project_id) => [
                { type: 'ChatHistory', id: project_id },
            ],
        }),

        createHistory: builder.mutation({
            query: ({ data, project_id }) => ({
                url: "new-chat/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { project_id }) => [
                { type: 'ChatHistory', id: project_id || localStorage.getItem("selectedProjectId") },
            ],
        }),

        getMessages: builder.query({
            query: ({ historyId, project_id }) => `messages-history/${historyId}/?project_id=${project_id}`,
            providesTags: (result, error, { historyId, project_id }) => [
                { type: 'ChatMessage', id: `${project_id}-${historyId}` },
            ],
        }),

        sendMessage: builder.mutation({
            query: ({ data, project_id }) => ({
                url: "messages/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { data, project_id }) => [
                { type: 'ChatMessage', id: `${project_id || localStorage.getItem("selectedProjectId")}-${data.message_history}` },
            ],
        }),

        renameHistory: builder.mutation({
            query: ({ historyId, title, project_id }) => ({
                url: `messages-history/${historyId}/rename/`,
                method: "PATCH",
                body: { title },
            }),
            invalidatesTags: (result, error, { project_id }) => [
                { type: 'ChatHistory', id: project_id || localStorage.getItem("selectedProjectId") },
            ],
        }),

        deleteHistory: builder.mutation({
            query: ({ historyId, project_id }) => ({
                url: `messages-history/${historyId}/delete/`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { project_id }) => [
                { type: 'ChatHistory', id: project_id || localStorage.getItem("selectedProjectId") },
            ],
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
