import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('authState');
        if (serializedState === null) {
            return {
                user: null,
                token: null,
                isAuthenticated: false,
            };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error("Could not load state", err);
        return {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    }
};

const initialState = loadState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;
            
            localStorage.setItem('token', accessToken);
            localStorage.setItem('authState', JSON.stringify({
                user,
                token: accessToken,
                isAuthenticated: true
            }));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('authState');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;