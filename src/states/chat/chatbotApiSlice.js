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
                /*url: "new-chat/",*/
                url: `/histories/?project_id=${project_id}`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { project_id }) => [
                { type: 'ChatHistory', id: project_id || localStorage.getItem("selectedProjectId") },
            ],
        }),

        getMessages: builder.query({
            query: ({ historyId, project_id }) => {
                const pid = project_id || localStorage.getItem("selectedProjectId");
                console.log("getMessages query - historyId:", historyId, "project_id:", pid);
                return `histories/${historyId}/?project_id=${pid}`;   
            },
            providesTags: (result, error, { historyId, project_id }) => {
                const pid = project_id || localStorage.getItem("selectedProjectId");
                return [{ type: 'ChatMessage', id: `${pid}-${historyId}` }];
            },
        }),

        sendMessage: builder.mutation({
            query: ({ data, project_id }) => ({
                url: "messages/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { data, project_id }) => {
                const pid = project_id || localStorage.getItem("selectedProjectId");
                return [
                    { type: 'ChatMessage', id: `${pid}-${data.message_history}` },
                ];
            },
        }),

        renameHistory: builder.mutation({
            query: ({ historyId, title, project_id }) => ({
                url: `histories/${historyId}/rename/`,
                method: "PATCH",
                body: { title },
            }),
            invalidatesTags: (result, error, { project_id }) => [
                { type: 'ChatHistory', id: project_id || localStorage.getItem("selectedProjectId") },
            ],
        }),

        deleteHistory: builder.mutation({
            query: ({ historyId, project_id }) => ({
                url: `histories/${historyId}/`,
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
