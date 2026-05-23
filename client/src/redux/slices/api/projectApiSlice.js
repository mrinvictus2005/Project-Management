import { apiSlice } from "../apiSlice"

const PROJECT_URL = "/project"

export const projectApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProjects: builder.query({
            query: () => ({
                url: PROJECT_URL,
                method: "GET",
                credentials: "include",
            }),
        }),

        createProject: builder.mutation({
            query: (data) => ({
                url: PROJECT_URL,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),

        updateProject: builder.mutation({
            query: (data) => ({
                url: `${PROJECT_URL}/${data._id}`,
                method: "PUT",
                body: data,
                credentials: "include",
            }),
        }),

        deleteProject: builder.mutation({
            query: (id) => ({
                url: `${PROJECT_URL}/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
        }),
    }),
})

export const {
    useGetProjectsQuery,
    useCreateProjectMutation,
    useUpdateProjectMutation,
    useDeleteProjectMutation,
} = projectApiSlice
