import React, { useState } from 'react';
import { 
    Dialog, 
    DialogContent, 
    Box, 
    Typography, 
    Button, 
    TextField,
    FormControlLabel,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    styled 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AestifyLogo from './ui/AestifyLogo';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        display: 'flex',
        width: '848px',
        padding: '40px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        borderRadius: '40px',
        background: '#FFF',
        boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
        margin: '16px',
        maxWidth: '848px',
    },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        display: 'flex',
        width: '464px',
        padding: '16px 24px',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '100px',
        background: 'rgba(215, 224, 244, 0.50)',
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: '2px solid #6F91D9',
        },
    },
    '& .MuiInputLabel-root': {
        color: '#000D17',
        fontWeight: '500',
        fontSize: '14px',
    },
    '& .MuiInputBase-input': {
        padding: '0px 16px',
        fontSize: '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        alignSelf: 'stretch',
    },
}));

const ContinueButton = styled(Button)(({ theme }) => ({
    display: 'flex',
    width: '464px',
    padding: '16px 24px',
    alignItems: 'center',
    gap: '16px',
    borderRadius: '100px',
    background: '#6F91D9',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    textTransform: 'none',
    '&:hover': {
        backgroundColor: '#5A7BC7',
    },
    '&:disabled': {
        backgroundColor: '#B4C6EB',
    },
    '& .MuiButton-label': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        flex: '1 0 0',
    },
}));

const OnboardingModal = ({ open, onClose, onComplete }) => {
    const theme = useTheme();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('female');
    const [country, setCountry] = useState('ukraine');
    const [language, setLanguage] = useState('english');

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            onComplete({ name, username, gender, country, language });
            onClose();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const isStep2Valid = name.trim() && username.trim();
    const isStep3Valid = gender;
    const isStep4Valid = country && language;

    return (
        <StyledDialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogContent sx={{ p: 0, textAlign: 'center', width: '100%', height: '100%' }}>
                {step === 1 ? (
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '40px',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%'
                        }}>
                            <AestifyLogo />
                        </Box>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000D17',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '51px',
                                fontStyle: 'normal',
                                fontWeight: '700',
                                lineHeight: 'normal'
                            }}
                        >
                            Almost There!
                        </Typography>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000D17',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '21px',
                                fontStyle: 'normal',
                                fontWeight: '400',
                                lineHeight: 'normal'
                            }}
                        >
                            Before we start, let's set up your profile.
                        </Typography>

                        <ContinueButton
                            onClick={handleContinue}
                        >
                            Continue
                        </ContinueButton>
                    </Box>
                ) : step === 2 ? (
 

                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '40px',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center'
                    }}>


                        <Typography 
                            sx={{ 
                                color: '#000D17',
                                fontFamily: 'Geologica',
                                fontSize: '21px',
                                fontStyle: 'normal',
                                fontWeight: '400',
                                lineHeight: 'normal'
                            }}
                        >
                            1 of 5
                        </Typography>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000D17',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '51px',
                                fontStyle: 'normal',
                                fontWeight: '700',
                                lineHeight: 'normal'
                            }}
                        >
                            What's your name?
                        </Typography>


                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000D17',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '21px',
                                fontStyle: 'normal',
                                fontWeight: '400',
                                lineHeight: 'normal'
                            }}
                        >
                            Let people you know to find you.
                        </Typography>

                        <Box sx={{ 
                            display: 'flex',
                            width: '470px',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '32px'
                        }}>
                            <Box>
                                <Typography 
                                    sx={{ 
                                        color: '#000D17',
                                        fontWeight: '500',
                                        mb: 1,
                                        textAlign: 'left',
                                        fontSize: '16px'
                                    }}
                                >
                                    Your name
                                </Typography>
                                <StyledTextField
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    variant="outlined"
                                />
                            </Box>

                            <Box>
                                <Typography 
                                    sx={{ 
                                        color: '#000D17',
                                        fontWeight: '500',
                                        mb: 1,
                                        textAlign: 'left',
                                        fontSize: '16px'
                                    }}
                                >
                                    Choose a Username
                                </Typography>
                                <StyledTextField
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    variant="outlined"
                                />
                            </Box>
                        </Box>

                        <ContinueButton
                            onClick={handleContinue}
                            disabled={!isStep2Valid}
                        >
                            Next
                        </ContinueButton>


                        <Typography 
                            sx={{ 
                                color: '#000D17',
                                fontSize: '14px'
                            }}
                        >
                            You can change this anytime in your settings.
                        </Typography>
                    </Box>
                ) : step === 3 ? (
        

                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '40px',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center'
                    }}>


                        <Box sx={{ 
                            display: 'flex',
                            width: '768px',
                            alignItems: 'center',
                            gap: '324px'
                        }}>
                            <Button
                                onClick={handleBack}
                                sx={{ 
                                    minWidth: 'auto',
                                    p: 1,
                                    color: '#000D17'
                                }}
                            >
                                <ArrowBackIcon />
                            </Button>
                            <Typography 
                                sx={{ 
                                    color: '#000D17',
                                    fontFamily: 'Geologica',
                                    fontSize: '21px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: 'normal'
                                }}
                            >
                                2 of 5
                            </Typography>
                        </Box>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000D17',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '51px',
                                fontStyle: 'normal',
                                fontWeight: '700',
                                lineHeight: 'normal'
                            }}
                        >
                            What's your gender?
                        </Typography>

                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '40px'
                        }}>
                            <Typography 
                                sx={{ 
                                    color: 'var(--Dark-900, #000D17)',
                                    textAlign: 'center',
                                    fontFamily: 'Geologica',
                                    fontSize: '21px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: 'normal'
                                }}
                            >
                                This helps us find more relevant content for you. We won't show it on your profile.
                            </Typography>
                        </Box>


                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '20px'
                        }}>
                            <RadioGroup
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                sx={{ 
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    gap: '20px'
                                }}
                            >
                                <FormControlLabel 
                                    value="female" 
                                    control={<Radio sx={{ 
                                        color: '#6F91D9', 
                                        '&.Mui-checked': { color: '#6F91D9' },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '28px'
                                        }
                                    }} />} 
                                    label="Female"
                                    sx={{ 
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '20px',
                                            color: '#000D17'
                                        }
                                    }}
                                />
                                <FormControlLabel 
                                    value="male" 
                                    control={<Radio sx={{ 
                                        color: '#6F91D9', 
                                        '&.Mui-checked': { color: '#6F91D9' },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '28px'
                                        }
                                    }} />} 
                                    label="Male"
                                    sx={{ 
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '20px',
                                            color: '#000D17'
                                        }
                                    }}
                                />
                                <FormControlLabel 
                                    value="other" 
                                    control={<Radio sx={{ 
                                        color: '#6F91D9', 
                                        '&.Mui-checked': { color: '#6F91D9' },
                                        '& .MuiSvgIcon-root': {
                                            fontSize: '28px'
                                        }
                                    }} />} 
                                    label="Specify another"
                                    sx={{ 
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        '& .MuiFormControlLabel-label': {
                                            fontSize: '20px',
                                            color: '#000D17'
                                        }
                                    }}
                                />
                            </RadioGroup>
                        </Box>

                        <ContinueButton
                            onClick={handleContinue}
                            disabled={!isStep3Valid}
                        >
                            Next
                        </ContinueButton>

                        <Typography 
                            sx={{ 
                                color: '#000D17',
                                fontSize: '14px'
                            }}
                        >
                            You can change this anytime in your settings.
                        </Typography>
                    </Box>
                ) : (


                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '40px',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{ 
                            display: 'flex',
                            width: '768px',
                            alignItems: 'center',
                            gap: '324px'
                        }}>
                            <Button
                                onClick={handleBack}
                                sx={{ 
                                    minWidth: 'auto',
                                    p: 1,
                                    color: '#000D17'
                                }}
                            >
                                <ArrowBackIcon />
                            </Button>
                            <Typography 
                                sx={{ 
                                    color: '#000D17',
                                    fontFamily: 'Geologica',
                                    fontSize: '21px',
                                    fontStyle: 'normal',
                                    fontWeight: '400',
                                    lineHeight: 'normal'
                                }}
                            >
                                3 of 5
                            </Typography>
                        </Box>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '51px',
                                fontStyle: 'normal',
                                fontWeight: '700',
                                lineHeight: 'normal'
                            }}
                        >
                            Where do you live and what language do you speak?
                        </Typography>

                        <Typography 
                            sx={{ 
                                alignSelf: 'stretch',
                                color: '#000',
                                textAlign: 'center',
                                fontFamily: 'Geologica',
                                fontSize: '21px',
                                fontStyle: 'normal',
                                fontWeight: '400',
                                lineHeight: 'normal'
                            }}
                        >
                            This information will always be private.
                        </Typography>


                        <Box sx={{ 
                            display: 'flex',
                            width: '400px',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '24px'
                        }}>
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <Typography 
                                    sx={{ 
                                        color: '#000D17',
                                        fontWeight: '500',
                                        textAlign: 'left',
                                        fontSize: '16px'
                                    }}
                                >
                                    Country
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        sx={{
                                            borderRadius: '100px',
                                            backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none'
                                            },
                                            '& .MuiSelect-select': {
                                                padding: '14px 24px',
                                                fontSize: '16px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="ukraine">Ukraine (Україна)</MenuItem>
                                        <MenuItem value="usa">United States</MenuItem>
                                        <MenuItem value="uk">United Kingdom</MenuItem>
                                        <MenuItem value="germany">Germany</MenuItem>
                                        <MenuItem value="france">France</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>

                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <Typography 
                                    sx={{ 
                                        color: '#000D17',
                                        fontWeight: '500',
                                        textAlign: 'left',
                                        fontSize: '16px'
                                    }}
                                >
                                    Language
                                </Typography>
                                <FormControl fullWidth>
                                    <Select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        sx={{
                                            borderRadius: '100px',
                                            backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                border: 'none'
                                            },
                                            '& .MuiSelect-select': {
                                                padding: '14px 24px',
                                                fontSize: '16px'
                                            }
                                        }}
                                    >
                                        <MenuItem value="english">English (UK)</MenuItem>
                                        <MenuItem value="ukrainian">Ukrainian</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                        <ContinueButton
                            onClick={handleContinue}
                            disabled={!isStep4Valid}
                        >
                            Next
                        </ContinueButton>

                        <Typography 
                            sx={{ 
                                color: '#000D17',
                                fontSize: '14px'
                            }}
                        >
                            You can change this anytime in your settings.
                        </Typography>
                    </Box>
                )}
            </DialogContent>
        </StyledDialog>
    );
};

export default OnboardingModal; 