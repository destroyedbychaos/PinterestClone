import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { store } from '../store'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from "@mui/material";
import { theme } from "./theme.js";
import { Web3Provider } from './contexts/Web3Context.jsx';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Web3Provider>
        <ThemeProvider theme={theme}>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="custom-toast"
          />
          <App />
        </ThemeProvider>
      </Web3Provider>
    </Provider>
  </StrictMode>,
)
