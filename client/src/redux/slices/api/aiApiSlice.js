import { apiSlice } from "../apiSlice"

const AI_URL = "/ai"

export const aiApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        askAssistant: builder.mutation({
            query: (data) => ({
                url: `${AI_URL}/chat`,
                method: "POST",
                body: data,
                credentials: "include",
            }),
        }),
    }),
})

export const { useAskAssistantMutation } = aiApiSlice
