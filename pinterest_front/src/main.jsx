import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ToastContainer } from 'react-toastify'
import {ThemeProvider} from "@mui/material";
import {theme} from "./theme.js";
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Web3Provider } from './contexts/Web3Context.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
      <ThemeProvider theme={theme}>
          <ToastContainer
              position="top-right"
              autoClose={2000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              theme="light"
          />
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Web3Provider>
              <App />
            </Web3Provider>
          </GoogleOAuthProvider>
      </ThemeProvider>
  </Provider>,
)
