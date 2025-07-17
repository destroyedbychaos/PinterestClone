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
            }}>
                <input
                    className={'input-field w-full focus:outline-none'}
                    type={type === 'password' && showPassword ? 'text' : type}
                    color={theme.palette.dark[200]}
                    placeholder={placeholder}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        width: '100%',
                        outline: 'none',
                        fontSize: '18px',
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
            </Box>
        </Box>
    );
};

export default InputField;