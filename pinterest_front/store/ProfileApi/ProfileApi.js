import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const profileApi = createApi({
  reducerPath: "profileApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      const token = state.auth?.token;
      
      console.log("Auth state:", state.auth);
      console.log("Token exists:", !!token);
      console.log("Token preview:", token ? token.substring(0, 20) + "..." : "No token");
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.error("No token found in auth state!");
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getMyProfile: builder.query({
      query: () => "/Profile/me",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation({
      query: (data) => {
        console.log("Sending profile update request:", data);
        return {
          url: "/Profile/update",
          method: "PUT",
          body: data,
        };
      },
      transformResponse: (response, meta, arg) => {
        console.log("Profile update response:", response);
        return response;
      },
      transformErrorResponse: (response, meta, arg) => {
        console.error("Profile update error:", response);
        return response;
      },
      invalidatesTags: ["Profile"],
    }),
        addInterests: builder.mutation({
      query: (interests) => ({
        url: "/Profile/add-interests",
        method: "POST",
        body: interests,
      }),
      invalidatesTags: ["Profile"],
    }),
    addVibes: builder.mutation({
      query: (vibes) => ({
        url: "/Profile/add-vibes", 
        method: "POST",
        body: vibes,
      }),
      invalidatesTags: ["Profile"],
    }),
    updateInterestsAndVibes: builder.mutation({
      query: (data) => ({
        url: "/Profile/update-interests-vibes",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Profile"],
    }),
    getAllUsers: builder.query({
      query: () => "/Profile/users",
      providesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useAddInterestsMutation,
  useAddVibesMutation,
  useUpdateInterestsAndVibesMutation,
  useGetAllUsersQuery,
} = profileApi;