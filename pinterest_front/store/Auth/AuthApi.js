import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/login',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ['User'],
        }),

        register: builder.mutation({
            query: (credentials) => ({
                url: 'register',
                method: 'POST',
                body: {
                    ...credentials,
                    role: credentials.role || 'User'
                }
            }),
            invalidatesTags: ['User'],
        }),

        getMe: builder.query({
            query: () => 'users/me',
            providesTags: ['User'],
        }),
    })
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetMeQuery,
} = authApi;