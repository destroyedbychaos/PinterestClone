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
    styled 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AestifyLogo from './ui/AestifyLogo';
import {interestCategories} from '../components/data/interestCategories.js';
import {vibes} from '../components/data/vibes.js';
import {
    StyledDialog,
    StyledTextField,
    ContinueButton,
    InterestCard,
    ImageContainer,
    CardImage,
    MasonryGrid,
    VibeCard,
    VibeImage,
    SelectedVibesGrid,
    SelectedVibeCard
} from '../components/ui/StyledComponents/OnBoardComponents.jsx';


const OnboardingModal = ({ open = true, onClose = () => {}, onComplete = () => {} }) => {
    const theme = useTheme();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [gender, setGender] = useState('female');
    const [country, setCountry] = useState('ukraine');
    const [language, setLanguage] = useState('english');
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [selectedVibes, setSelectedVibes] = useState([]);

    const handleContinue = () => {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        } else if (step === 3) {
            setStep(4);
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            setStep(6);
        } else if (step === 6) {
            setStep(7);
        } else if (step === 7) {
            onComplete({ 
                name, 
                username, 
                gender, 
                country, 
                language, 
                interests: selectedInterests,
                vibes: selectedVibes 
            });
            onClose();
        }
    };

    const handleInterestToggle = (interestId) => {
        setSelectedInterests(prev => {
            if (prev.includes(interestId)) {
                return prev.filter(id => id !== interestId);
            }
            return [...prev, interestId];
        });
    };

    const handleVibeToggle = (vibeId) => {
        setSelectedVibes(prev => {
            if (prev.includes(vibeId)) {
                return prev.filter(id => id !== vibeId);
            }
            return [...prev, vibeId];
        });
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const isStep2Valid = name.trim() && username.trim();
    const isStep3Valid = gender;
    const isStep4Valid = country && language;
    const isStep5Valid = selectedInterests.length > 0;
    const isStep6Valid = selectedVibes.length >= 3;

    const getSelectedVibesData = () => {
        return vibes.filter(vibe => selectedVibes.includes(vibe.id)).slice(0, 3);
    };

    return (
        <StyledDialog 
            open={open} 
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            dialogwidth={step === 5 || step === 6 ? '1050px' : '848px'}
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

                        <ContinueButton onClick={handleContinue}>
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
                            justifyContent: 'space-between'
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
                            
                            <Box sx={{ width: 40 }} />
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

                        <Typography 
                            sx={{ 
                                color: '#000D17',
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
                ) : step === 4 ? (
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
                            width: '100%',
                            maxWidth: '800px',
                            alignItems: 'center',
                            justifyContent: 'space-between'
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
                            
                            <Box sx={{ width: 40 }} />
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
                            Where do you live and what language do you speak?
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
                            This information will always be private.
                        </Typography>

                        <Box sx={{ 
                            display: 'flex',
                            width: '500px',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '24px'
                        }}>
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '8px',
                                width: '100%'
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
                                                fontSize: '16px',
                                                textAlign: 'left',
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
                                gap: '8px',
                                width: '100%'
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
                                                fontSize: '16px',
                                                textAlign: 'left',
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
                ) : step === 5 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        width: '100%',
                        height: '600px',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            width: '100%',
                            maxWidth: '1200px',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Button 
                                onClick={handleBack} 
                                sx={{ 
                                    minWidth: 'auto', 
                                    p: 0, 
                                    color: '#000D17', 
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
                                4 of 5
                            </Typography>
                            
                            <Box sx={{ width: 40 }} />
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
                            Customize your feed
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
                            Select at least one of your interest.
                        </Typography>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            justifyContent: 'center',
                            width: '100%',
                            maxWidth: '1200px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            py: 2,
                            px: 4,
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'gray',
                                borderRadius: '10px',
                            }
                        }}>
                            {interestCategories.map((interest) => (
                                <InterestCard 
                                    key={interest.id}
                                    onClick={() => handleInterestToggle(interest.id)}
                                >
                                    <ImageContainer selected={selectedInterests.includes(interest.id)}>
                                        <CardImage 
                                            src={interest.image} 
                                            alt={interest.title}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.background = '#6F91D9';
                                            }}
                                        />
                                    </ImageContainer>
                                    <Typography 
                                        sx={{ 
                                            color: '#000D17',
                                            textAlign: 'center',
                                            fontFamily: 'Geologica',
                                            fontSize: '16px',
                                            fontStyle: 'normal',
                                            fontWeight: '500',
                                            lineHeight: 'normal'
                                        }}
                                    >
                                        {interest.title}
                                    </Typography>
                                </InterestCard>
                            ))}
                        </Box>

                        <ContinueButton
                            onClick={handleContinue}
                            disabled={!isStep5Valid}
                        >
                            Continue
                        </ContinueButton>
                    </Box>
                ) : step === 6 ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '24px',
                        width: '100%',
                        height: '600px',
                        justifyContent: 'center'
                    }}>
                        <Box sx={{
                            display: 'flex',
                            width: '100%',
                            maxWidth: '1200px',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Button 
                                onClick={handleBack} 
                                sx={{ 
                                    minWidth: 'auto', 
                                    p: 1, 
                                    color: '#000D17', 
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
                                5 of 5
                            </Typography>
                            
                            <Box sx={{ width: 40 }} />
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
                            Customize your feed
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
                            Select 3 or more Aests to start curating your vibe.
                        </Typography>

                        <Box sx={{
                            width: '100%',
                            maxWidth: '900px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            py: 2,
                            px: 2,
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: 'rgba(0,0,0,0.1)',
                                borderRadius: '10px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: 'gray',
                                borderRadius: '10px',
                            }
                        }}>
                            <MasonryGrid>
                                {vibes.map((vibe) => (
                                    <VibeCard 
                                        key={vibe.id}
                                        height={vibe.height}
                                        selected={selectedVibes.includes(vibe.id)}
                                        onClick={() => handleVibeToggle(vibe.id)}
                                    >
                                        <VibeImage 
                                            src={vibe.image} 
                                            alt={`Vibe ${vibe.id}`}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.style.background = '#6F91D9';
                                            }}
                                        />
                                    </VibeCard>
                                ))}
                            </MasonryGrid>
                        </Box>

                        <ContinueButton
                            onClick={handleContinue}
                            disabled={!isStep6Valid}
                        >
                            Finish set up
                        </ContinueButton>
                    </Box>
                ) : 
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    width: '100%',
                    height: '600px',
                    justifyContent: 'center',
                }}>
                    <Typography 
                        sx={{ 
                            alignSelf: 'stretch',
                            color: '#000D17',
                            textAlign: 'center',
                            fontFamily: 'Geologica',
                            fontSize: '51px',
                            fontStyle: 'normal',
                            fontWeight: '700',
                            lineHeight: 'normal',
                            
                        }}
                    >
                        You've got great taste!
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
                            lineHeight: 'normal',
                            paddingBottom: '10px'
                        }}
                    >
                        Now let's make your feed shine...
                    </Typography>
                
                    <SelectedVibesGrid>
                        {getSelectedVibesData().map((vibe) => (
                            <SelectedVibeCard 
                                key={vibe.id}
                                height={Math.min(vibe.height, 300)}
                            >
                                <VibeImage 
                                    src={vibe.image} 
                                    alt={`Selected Vibe ${vibe.id}`}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.style.background = '#6F91D9';
                                    }}
                                />
                            </SelectedVibeCard>
                        ))}
                    </SelectedVibesGrid>
                </Box>
                }
            </DialogContent>
        </StyledDialog>
    );
};

export default OnboardingModal;