import { configureStore } from '@reduxjs/toolkit'
import { authApi } from '../store/Auth/AuthApi.js'
import authSlice from '../store/slices/AuthSlice.js'
import pinterestAuthSlice from '../store/slices/PinterestAuthSlice.js'
import nftAuthSlice from '../store/slices/NFTAuthSlice.js'

export const store = configureStore({
    reducer: {
        auth: authSlice,
        pinterestAuth: pinterestAuthSlice,
        nftAuth: nftAuthSlice,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authApi.middleware),
})