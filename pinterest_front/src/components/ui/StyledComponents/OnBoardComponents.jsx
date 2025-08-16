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
export const StyledDialog = styled(Dialog)(({ theme, dialogwidth }) => ({
    '& .MuiDialog-paper': {
        display: 'flex',
        width: dialogwidth || '848px',
        padding: '40px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '40px',
        borderRadius: '40px',
        background: '#FFF',
        boxShadow: '-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
        margin: '16px',
        maxWidth: dialogwidth || '848px',
    },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
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

export const ContinueButton = styled(Button)(({ theme }) => ({
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
}));

export const InterestCard = styled(Box)(({ theme, selected }) => ({
    position: 'relative',
    width: '200px',
    height: '180px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
}));

export const ImageContainer = styled(Box)(({ selected }) => ({
    position: 'relative',
    width: '200px',
    height: '180px',
    borderRadius: '30px',
    overflow: 'hidden',
    border: selected ? '3px solid #6F91D9' : 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: selected ? '0 8px 24px rgba(111, 145, 217, 0.3)' : '0 8px 24px rgba(0,0,0,0.1)',
    },
}));

export const CardImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover', 
    objectPosition: 'center',
    display: 'block',
    minWidth: '105%',
    minHeight: '105%',
});

export const MasonryGrid = styled(Box)(({ theme }) => ({
    columnCount: 4,
    width: '100%',
    maxWidth: '900px',
    columnGap: '20px',
    rowGap: '20px',
    '& > *': {
        breakInside: 'avoid',
        marginBottom: '10px',
        display: 'inline-block',
        width: '100%',
    },
}));

export const VibeCard = styled(Box)(({ selected, height }) => ({
    position: 'relative',
    cursor: 'pointer',
    width: '100%',
    borderRadius: '30px',
    overflow: 'hidden',
    border: selected ? '3px solid #6F91D9' : 'none',
    height: `${height}px`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: selected ? '0 8px 24px rgba(111, 145, 217, 0.3)' : '0 8px 24px rgba(0,0,0,0.1)',
    },
}));

export const VibeImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
});

export const SelectedVibesGrid = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: '20px',
    width: '100%',
    maxWidth: '700px',
    flexWrap: 'wrap',
}));

export const SelectedVibeCard = styled(Box)(({ height }) => ({
    position: 'relative',
    width: '200px',
    borderRadius: '30px',
    overflow: 'hidden',
    height: `${height}px`,
    maxHeight: '300px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

