import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import defaultBoardImage from '../../src/assets/images/5.png';
export const boardsApi = createApi({
    reducerPath: 'boardsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Board'],
    endpoints: (builder) => ({
        getUserBoards: builder.query({
            query: ({ 
                username, 
                pageNumber = 1, 
                pageSize = 20, 
                sortBy = 'createdAt', 
                isAscending = false,
                isArchived = null,
                groupBy = null
            }) => ({
                url: `/Boards/user/username/${username}`,
                params: {
                    pageNumber,
                    pageSize,
                    sortBy,
                    isAscending,
                    ...(isArchived !== null && { isArchived }),
                    ...(groupBy && { groupBy })
                }
            }),
            providesTags: ['Board'],
    transformResponse: (response) => {
        return {
            boards: response.boards?.map(board => ({
                id: board.id,
                name: board.name,
                count: `${board.assetsCount || 0} Assets`,
                image: board.coverImageUrl || null,
                isPrivate: board.isPrivate || false,
                description: board.description,
                createdAt: board.createdAt,
                updatedAt: board.updatedAt,
                isArchived: board.isArchived || false
            })) || [],
            totalCount: response.totalCount || 0,
            pageNumber: response.pageNumber || 1,
            pageSize: response.pageSize || 20,
            totalPages: response.totalPages || 1
        };
    }
        }),

        getAllBoards: builder.query({
            query: ({ 
                pageNumber = 1, 
                pageSize = 20, 
                searchTerm = null,
                sortBy = 'createdAt', 
                isAscending = false,
                isArchived = null,
                groupBy = null
            }) => ({
                url: `/Boards`,
                params: {
                    pageNumber,
                    pageSize,
                    ...(searchTerm && { searchTerm }),
                    sortBy,
                    isAscending,
                    ...(isArchived !== null && { isArchived }),
                    ...(groupBy && { groupBy })
                }
            }),
            providesTags: ['Board'],
        }),

        createBoard: builder.mutation({
            query: (boardData) => ({
                url: '/Boards',
                method: 'POST',
                body: boardData,
            }),
            invalidatesTags: ['Board'],
        }),

        updateBoard: builder.mutation({
            query: ({ id, ...boardData }) => ({
                url: `/Boards/${id}`,
                method: 'PUT',
                body: boardData,
            }),
            invalidatesTags: ['Board'],
        }),

        deleteBoard: builder.mutation({
            query: (id) => ({
                url: `/Boards/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Board'],
        }),

        getBoardById: builder.query({
            query: (id) => `/Boards/${id}`,
            providesTags: (result, error, id) => [{ type: 'Board', id }],
        }),

        archiveBoard: builder.mutation({
            query: (id) => ({
                url: `/Boards/${id}/archive`,
                method: 'POST',
            }),
            invalidatesTags: ['Board'],
        }),

        restoreBoard: builder.mutation({
            query: (id) => ({
                url: `/Boards/${id}/restore`,
                method: 'POST',
            }),
            invalidatesTags: ['Board'],
        }),
    })
});

export const {
    useGetUserBoardsQuery,
    useGetAllBoardsQuery,
    useCreateBoardMutation,
    useUpdateBoardMutation,
    useDeleteBoardMutation,
    useGetBoardByIdQuery,
    useArchiveBoardMutation,
    useRestoreBoardMutation,
} = boardsApi;