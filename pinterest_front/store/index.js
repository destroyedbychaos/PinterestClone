import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../store/Auth/AuthApi.js'
import { profileApi } from '../store/ProfileApi/ProfileApi.js'
import { boardsApi } from '../store/Boards/BoardsApi.js'
import { pinApi } from '../store/Pins/PinApi.js'
import authSlice from '../store/slices/AuthSlice.js'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        [authApi.reducerPath]: authApi.reducer,
        [boardsApi.reducerPath]: boardsApi.reducer,
        [pinApi.reducerPath]: pinApi.reducer,
        [profileApi.reducerPath]: profileApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
        .concat(authApi.middleware)
        .concat(boardsApi.middleware)
        .concat(profileApi.middleware)
        .concat(pinApi.middleware),
})