import React from 'react';
import { Box, Typography, Icon } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const InputField = ({label, type, value, onChange, placeholder, id, required, showPassword, setShowPassword}) => {
    const theme = useTheme();

    return (
        <Box sx={{
            width: '464px',
            gap: '12px',
        }}>
            <Typography
                color={theme.palette.blue[500]}
                paddingLeft={'16px'}
                paddingRight={'16px'}
                gap={'10px'}
                fontWeight="300"
                fontStyle='Light'
                fontSize={'14px'}
                lineHeight={'100%'}
                width={'432px'}
                height={'18px'}
                sx={{ mb: 0.5 }}
            >
                {label}
            </Typography>
            <Box sx={{
                height: '51px',
                padding: '12px 20px',
                backgroundColor: '#D7E0F480',
                borderRadius: '100px',
                fontWeight: '400',
                fontStyle: 'Regular',
                fontSize: '18px',
                lineHeight: '100%',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
            }}>
                <input
                    className={'input-field w-full focus:outline-none'}
                    type={type === 'password' && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    lang="en-US"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        width: '100%',
                        outline: 'none',
                        fontSize: '18px',
                        colorScheme: 'light',
                    }}
                />
                {type === 'password' && (
                    <Icon
                        sx={{
                            cursor: 'pointer',
                            color: theme.palette.dark[300],
                            ml: 1,
                            '& svg': {
                                fill: 'currentColor'
                            }
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ?
                            <svg width="24" height="24" viewBox="0 0 24 24"><path d="M15.5 12a3.5 3.5 0 11-7 0 3.5 3.5 0 017 0z"/><path fill="currentColor" fillRule="evenodd" d="M12 3.5c-3.432 0-6.125 1.534-8.054 3.24C2.02 8.445.814 10.352.33 11.202a1.6 1.6 0 000 1.598c.484.85 1.69 2.758 3.616 4.46C5.876 18.966 8.568 20.5 12 20.5c3.432 0 6.125-1.534 8.054-3.24 1.926-1.704 3.132-3.611 3.616-4.461a1.6 1.6 0 000-1.598c-.484-.85-1.69-2.757-3.616-4.46C18.124 5.034 15.432 3.5 12 3.5zM1.633 11.945c.441-.774 1.551-2.528 3.307-4.08C6.69 6.314 9.045 5 12 5c2.955 0 5.309 1.315 7.06 2.864 1.756 1.553 2.866 3.307 3.307 4.08a.111.111 0 01.017.056.111.111 0 01-.017.056c-.441.774-1.551 2.527-3.307 4.08C17.31 17.685 14.955 19 12 19c-2.955 0-5.309-1.315-7.06-2.864-1.756-1.553-2.866-3.306-3.307-4.08A.11.11 0 011.616 12a.11.11 0 01.017-.055z"/></svg>
                            :
                            <svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M8.052 5.837A9.715 9.715 0 0112 5c2.955 0 5.309 1.315 7.06 2.864 1.756 1.553 2.866 3.307 3.307 4.08a.11.11 0 01.016.055.122.122 0 01-.017.06 16.766 16.766 0 01-1.53 2.218.75.75 0 101.163.946 18.253 18.253 0 001.67-2.42 1.607 1.607 0 00.001-1.602c-.485-.85-1.69-2.757-3.616-4.46C18.124 5.034 15.432 3.5 12 3.5c-1.695 0-3.215.374-4.552.963a.75.75 0 00.604 1.373z"/><path fill="currentColor" fillRule="evenodd" d="M19.166 17.987C17.328 19.38 14.933 20.5 12 20.5c-3.432 0-6.125-1.534-8.054-3.24C2.02 15.556.814 13.648.33 12.798a1.606 1.606 0 01.001-1.6A18.305 18.305 0 013.648 7.01L1.317 5.362a.75.75 0 11.866-1.224l20.5 14.5a.75.75 0 11-.866 1.224l-2.651-1.875zM4.902 7.898c-1.73 1.541-2.828 3.273-3.268 4.044a.118.118 0 00-.017.059c0 .015.003.034.016.055.441.774 1.551 2.527 3.307 4.08C6.69 17.685 9.045 19 12 19c2.334 0 4.29-.82 5.874-1.927l-3.516-2.487a3.5 3.5 0 01-5.583-3.949L4.902 7.899z"/></svg>
                        }
                    </Icon>
                )}
                {type === 'date' && (
                    <Icon
                        sx={{
                            color: theme.palette.dark[300],
                            ml: 1,
                            pointerEvents: 'all',
                            cursor: 'pointer',
                            position: 'absolute',
                            right: '20px',
                            zIndex: 1,
                            '& svg': {
                                fill: 'currentColor',
                                width: '22px',
                                height: '22px'
                            }
                        }}
                        onClick={() => {
                            const input = document.getElementById(id);
                            if (input) {
                                input.showPicker();
                            }
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.75 0C6.94891 0 7.13968 0.0790176 7.28033 0.21967C7.42098 0.360322 7.5 0.551088 7.5 0.75V3H16.5V0.75C16.5 0.551088 16.579 0.360322 16.7197 0.21967C16.8603 0.0790176 17.0511 0 17.25 0C17.4489 0 17.6397 0.0790176 17.7803 0.21967C17.921 0.360322 18 0.551088 18 0.75V3H20.75C21.716 3 22.5 3.784 22.5 4.75V20.75C22.5 21.2141 22.3156 21.6592 21.9874 21.9874C21.6592 22.3156 21.2141 22.5 20.75 22.5H3.25C2.78587 22.5 2.34075 22.3156 2.01256 21.9874C1.68437 21.6592 1.5 21.2141 1.5 20.75V4.75C1.5 3.784 2.284 3 3.25 3H6V0.75C6 0.551088 6.07902 0.360322 6.21967 0.21967C6.36032 0.0790176 6.55109 0 6.75 0ZM21 9.5H3V20.75C3 20.888 3.112 21 3.25 21H20.75C20.8163 21 20.8799 20.9737 20.9268 20.9268C20.9737 20.8799 21 20.8163 21 20.75V9.5ZM3.25 4.5C3.1837 4.5 3.12011 4.52634 3.07322 4.57322C3.02634 4.62011 3 4.6837 3 4.75V8H21V4.75C21 4.6837 20.9737 4.62011 20.9268 4.57322C20.8799 4.52634 20.8163 4.5 20.75 4.5H3.25Z" fill="#52697C"/>
                        </svg>
                    </Icon>
                )}
            </Box>
            
            {type === 'date' && (
                <style jsx>{`
                    input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0; cursor: pointer; width: 100%; height: 100%; position: absolute; left: 0; top: 0; }
                    input[type="date"] { -webkit-appearance: none; -moz-appearance: textfield; cursor: pointer; }
                    input[type="date"]::-webkit-inner-spin-button, input[type="date"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                    input[type="date"]::placeholder { color: #7B8D9B !important; opacity: 1; }
                    input[type="date"]:invalid { color: #7B8D9B; }
                `}</style>
            )}
        </Box>
    );
};

export default InputField;