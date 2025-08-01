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
            };
        }
        
        if (serializedState) {
            return JSON.parse(serializedState);
        }
        
        // Якщо є токен, але немає стану, повертаємо базовий стан
        return {
            user: null,
            token: authToken,
            isAuthenticated: false,
        };
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
            
            localStorage.setItem('authToken', accessToken);
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
            localStorage.removeItem('authToken');
            localStorage.removeItem('authState');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;