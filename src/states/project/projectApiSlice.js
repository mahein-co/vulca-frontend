import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithHeaders } from "../apiConfig";

export const projectApiSlice = createApi({
    reducerPath: "projectApi",
    baseQuery: baseQueryWithHeaders,
    tagTypes: ["Projects", "ProjectAccess"],
    endpoints: (builder) => ({
        // LIST PROJECTS (Admin/User unfiltered)
        getProjects: builder.query({
            query: () => "projects/",
            providesTags: ["Projects"],
        }),

        // LIST ACTIVE PROJECTS FOR USER (For selector)
        getUserActiveProjects: builder.query({
            query: () => "projects/user-active/",
            providesTags: ["Projects"],
        }),

        // CREATE PROJECT
        createProject: builder.mutation({
            query: (data) => ({
                url: "projects/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Projects"],
        }),

        // UPDATE PROJECT
        updateProject: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `projects/${id}/`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["Projects"],
        }),

        // DELETE PROJECT
        deleteProject: builder.mutation({
            query: (id) => ({
                url: `projects/${id}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["Projects"],
        }),

        // REQUEST ACCESS
        requestAccess: builder.mutation({
            query: (data) => ({
                url: "projects/request-access/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ProjectAccess"],
        }),

        // MANAGE ACCESS (Admin)
        manageAccess: builder.mutation({
            query: (data) => ({
                url: "projects/manage-access/",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["ProjectAccess"],
        }),

        // GET PENDING REQUESTS (Admin)
        getPendingRequests: builder.query({
            query: () => "projects/manage-access/?status=pending",
            providesTags: ["ProjectAccess"],
        }),
    }),
});

export const {
    useGetProjectsQuery,
    useGetUserActiveProjectsQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
    useRequestAccessMutation,
    useManageAccessMutation,
    useGetPendingRequestsQuery,
} = projectApiSlice;
