import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/Auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['User'],
        }),

        register: builder.mutation({
            query: (credentials) => ({
                url: '/Auth/register',
                method: 'POST',
                body: {
                    ...credentials,
                    role: credentials.role || 'User'
                }
            }),
            invalidatesTags: ['User'],
        }),

        refreshToken: builder.mutation({
            query: () => ({
                url: '/Auth/refresh',
                method: 'POST'
            }),
            invalidatesTags: ['User'],
        }),
        
    })
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useRefreshTokenMutation,
} = authApi;