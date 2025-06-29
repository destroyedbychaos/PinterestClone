import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../store/Auth/AuthApi.js'
import authSlice from '../store/slices/AuthSlice.js'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
})