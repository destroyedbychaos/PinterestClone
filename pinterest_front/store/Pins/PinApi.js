
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const pinApi = createApi({
  reducerPath: 'pinApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token || 
                    localStorage.getItem('authToken') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('authToken') || 
                    sessionStorage.getItem('token');
    
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    
      return headers;
    }
    ,
  }),
  tagTypes: ['Pin'],
  endpoints: (builder) => ({
    getUserPins: builder.query({
      query: ({ userName, pageNumber = 1, pageSize = 20, sortBy = 'createdAt', isAscending = false }) => ({
        url: `/Pins/user/${encodeURIComponent(userName)}`,
        params: {
          pageNumber,
          pageSize,
          sortBy,
          isAscending,
        },
      }),
      providesTags: ['Pin'],
    }),

    createPin: builder.mutation({
      query: (pinData) => {
        const isFormData = pinData instanceof FormData;
        
        console.log('PinApi createPin called with:', isFormData ? 'FormData' : 'JSON', pinData);
        
        if (isFormData) {
          return {
            url: '/Pins',
            method: 'POST',
            body: pinData,
          };
        } else {
          return {
            url: '/Pins',
            method: 'POST',
            body: JSON.stringify(pinData),
            headers: {
              'Content-Type': 'application/json',
            },
          };
        }
      },
      invalidatesTags: ['Pin'],
    }),

    updatePin: builder.mutation({
      query: ({ id, ...pinData }) => ({
        url: `/Pins/${id}`,
        method: 'PUT',
        body: JSON.stringify(pinData),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['Pin'],
    }),

    deletePin: builder.mutation({
      query: (id) => ({
        url: `/Pins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pin'],
    }),

    getPinById: builder.query({
      query: (id) => `/Pins/${id}`,
      providesTags: (result, error, id) => [{ type: 'Pin', id }],
    }),

    getPins: builder.query({
      query: ({ pageNumber = 1, pageSize = 20, searchTerm, tags, sortBy = 'createdAt', isAscending = false }) => ({
        url: '/Pins',
        params: {
          pageNumber,
          pageSize,
          searchTerm,
          tags,
          sortBy,
          isAscending,
        },
      }),
      providesTags: ['Pin'],
    }),

    addPinToBoard: builder.mutation({
      query: ({ pinId, boardId }) => ({
        url: `/Pins/${pinId}/boards/${boardId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Pin'],
    }),

    removePinFromBoard: builder.mutation({
      query: ({ pinId, boardId }) => ({
        url: `/Pins/${pinId}/boards/${boardId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pin'],
    }),

    searchPins: builder.query({
      query: ({ searchTerm, searchInTitle = true, searchInDescription = true, exactMatch = false, pageNumber = 1, pageSize = 20 }) => ({
        url: '/Pins/search',
        params: {
          searchTerm,
          searchInTitle,
          searchInDescription,
          exactMatch,
          pageNumber,
          pageSize,
        },
      }),
      providesTags: ['Pin'],
    }),
  }),
});

export const {
  useGetUserPinsQuery,
  useCreatePinMutation,
  useUpdatePinMutation,
  useDeletePinMutation,
  useGetPinByIdQuery,
  useGetPinsQuery,
  useAddPinToBoardMutation,
  useRemovePinFromBoardMutation,
  useSearchPinsQuery,
} = pinApi;