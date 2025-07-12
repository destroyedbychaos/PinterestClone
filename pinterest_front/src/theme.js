import {createTheme} from "@mui/material";


export const theme = createTheme({
    typography: {
        fontFamily: 'Geologica, sans-serif',
    },
    palette: {
        primary: {
            main: '#6F91D9',
        },
        text: {
            primary: '#000D17',
        },
        blue: {
            500: '#01233F',
            200: '#B4C6EB',
            50: '#D7E0F4',
        },
        dark: {
            200: '#7B8D9B'
        }
    }})