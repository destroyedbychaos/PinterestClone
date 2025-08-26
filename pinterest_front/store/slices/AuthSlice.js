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
        const loadedState = JSON.parse(serializedState);
        
        return loadedState;
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
            const { user, accessToken, token } = action.payload;
            
            const authToken = accessToken || token;
            
            console.log("Setting credentials:", { user, authToken: !!authToken });
            
            state.user = user;
            state.token = authToken;
            state.isAuthenticated = true;
            
            localStorage.setItem('token', authToken);
            localStorage.setItem('authState', JSON.stringify({
                user,
                token: authToken,
                isAuthenticated: true
            }));
            
            console.log("Saved auth state:", { user, token: !!authToken, isAuthenticated: true });
        },
        logout: (state) => {
            console.log("Logging out...");
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('authState');
            localStorage.removeItem('userPassword'); 
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('authState', JSON.stringify({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }));
        },
    },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;