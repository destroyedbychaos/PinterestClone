import { createSlice } from '@reduxjs/toolkit';

const loadNFTState = () => {
    try {
        const serializedState = localStorage.getItem('nftAuthState');
        const authToken = localStorage.getItem('nftAuthToken');
        
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
        console.error("Could not load NFT auth state", err);
        return {
            user: null,
            token: null,
            isAuthenticated: false,
        };
    }
};

const initialState = loadNFTState();

const nftAuthSlice = createSlice({
    name: 'nftAuth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken } = action.payload;
            state.user = user;
            state.token = accessToken;
            state.isAuthenticated = true;
            
            localStorage.setItem('nftAuthToken', accessToken);
            localStorage.setItem('nftAuthState', JSON.stringify({
                user,
                token: accessToken,
                isAuthenticated: true,
            }));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('nftAuthToken');
            localStorage.removeItem('nftAuthState');
        },
    },
});

export const { setCredentials, logout } = nftAuthSlice.actions;
export default nftAuthSlice.reducer;
