import { createSlice } from '@reduxjs/toolkit';

const loadPinterestState = () => {
    try {
        const serializedState = localStorage.getItem('pinterestAuthState');
        const authToken = localStorage.getItem('pinterestAuthToken');
        
        if (serializedState === null && !authToken) {
            return {
                user: null,
                token: null,
                isAuthenticated: false,
            };
        }
        
        if (serializedState) {
            const parsed = JSON.parse(serializedState);
            return {
                user: parsed.user || null,
                token: parsed.token || null,
                isAuthenticated: !!parsed.isAuthenticated,
            };
        }
        
        return {
            user: null,
            token: authToken,
            isAuthenticated: false,
        };
    } catch (err) {
        console.error("Could not load Pinterest auth state", err);
        return {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    }
};

const initialState = loadPinterestState();

const pinterestAuthSlice = createSlice({
    name: 'pinterestAuth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;
            
            localStorage.setItem('pinterestAuthToken', accessToken);
            localStorage.setItem('pinterestAuthState', JSON.stringify({
                user,
                token: accessToken,
                isAuthenticated: true,
            }));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('pinterestAuthToken');
            localStorage.removeItem('pinterestAuthState');
        },
    },
});

export const { setCredentials, logout } = pinterestAuthSlice.actions;
export default pinterestAuthSlice.reducer;
