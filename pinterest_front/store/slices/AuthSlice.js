import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('authState');
        const authToken = localStorage.getItem('authToken');
        
        if (serializedState === null && !authToken) {
            return {
                user: null,
                token: null,
                isAuthenticated: false,
                origin: null,
            };
        }
        
        if (serializedState) {
            const parsed = JSON.parse(serializedState);
            return {
                user: parsed.user || null,
                token: parsed.token || null,
                isAuthenticated: !!parsed.isAuthenticated,
                origin: parsed.origin || null,
            };
        }
        

        return {
            user: null,
            token: authToken,
            isAuthenticated: false,
            origin: null,
        };
    } catch (err) {
        console.error("Could not load state", err);
        return {
            user: null,
            token: null,
            isAuthenticated: false,
            origin: null,
        };
    }
};

const initialState = loadState();

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, origin } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;
            state.origin = origin || state.origin || 'site';
            
            localStorage.setItem('authToken', accessToken);
            localStorage.setItem('authState', JSON.stringify({
                user,
                token: accessToken,
                isAuthenticated: true,
                origin: state.origin,
            }));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.origin = null;
            localStorage.removeItem('authToken');
            localStorage.removeItem('authState');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;