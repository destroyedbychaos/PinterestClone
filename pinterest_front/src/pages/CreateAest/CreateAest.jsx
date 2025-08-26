import React, { useState, useEffect, useRef } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Paper,
    Button,
    TextField,
    Modal,
    Backdrop
} from '@mui/material';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { useTheme } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';

const CreateAest = () => {
    const user = useCurrentUser();
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragOverAnimation, setDragOverAnimation] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [aestInfo, setAestInfo] = useState({
        title: '',
        description: '',
        link: '',
        hashtags: ''
    });
    const fileInputRef = useRef(null);
    const addMoreInputRef = useRef(null);
    const theme = useTheme();
    const dragCountRef = useRef(0);

    const isFormValid = uploadedFiles.length > 0 && 
        uploadedFiles[selectedImageIndex]?.title?.trim() && 
        uploadedFiles[selectedImageIndex]?.description?.trim() && 
        uploadedFiles[selectedImageIndex]?.link?.trim() && 
        uploadedFiles[selectedImageIndex]?.hashtags?.trim();

    useEffect(() => {
        const savedData = localStorage.getItem('aestData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            setUploadedFiles(parsedData.uploadedFiles || []);
            setAestInfo(parsedData.aestInfo || {
                title: '',
                description: '',
                link: '',
                hashtags: ''
            });
            setCurrentStep(parsedData.currentStep || 0);
            setSelectedImageIndex(parsedData.selectedImageIndex || 0);
            setSelectedBoard(parsedData.selectedBoard || null);
        }
    }, []);

    const boards = [
        {
          name: "Beautiful photoshoots",
          count: "5 Assets",
          image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop",
          isPrivate: true
        },
        {
          name: "Mobile wallpapers", 
          count: "3.5k Assets",
          image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
          isPrivate: false
        },
        {
          name: "Recipes",
          count: "2.5k Pins", 
          image: "https://cdn.loveandlemons.com/wp-content/uploads/2024/07/ratatouille.jpg",
          isPrivate: false
        },
        {
          name: "Travel destinations",
          count: "1.2k Assets",
          image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=400&fit=crop",
          isPrivate: false
        },
        {
          name: "Interior design",
          count: "850 Assets", 
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
          isPrivate: true
        }
      ];

    useEffect(() => {
        const dataToSave = {
            uploadedFiles,
            aestInfo,
            currentStep,
            selectedImageIndex,
            selectedBoard
        };
        localStorage.setItem('aestData', JSON.stringify(dataToSave));
    }, [uploadedFiles, aestInfo, currentStep, selectedImageIndex, selectedBoard]);

    useEffect(() => {
        const handleGlobalDragEnter = (e) => {
            e.preventDefault();
            dragCountRef.current++;
            if (dragCountRef.current === 1 && currentStep === 0) {
                setDragOverAnimation(true);
            }
        };

        const handleGlobalDragLeave = (e) => {
            e.preventDefault();
            dragCountRef.current--;
            if (dragCountRef.current === 0) {
                setDragOverAnimation(false);
            }
        };

        const handleGlobalDragOver = (e) => {
            e.preventDefault();
        };

        const handleGlobalDrop = (e) => {
            e.preventDefault();
            e.stopPropagation();
            dragCountRef.current = 0;
            setDragOverAnimation(false);
            setIsDragOver(false);
            
            if (currentStep !== 0) return;
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                handleMultipleFileUpload(imageFiles);
            }
        };

        document.addEventListener('dragenter', handleGlobalDragEnter);
        document.addEventListener('dragleave', handleGlobalDragLeave);
        document.addEventListener('dragover', handleGlobalDragOver);
        document.addEventListener('drop', handleGlobalDrop);

        return () => {
            document.removeEventListener('dragenter', handleGlobalDragEnter);
            document.removeEventListener('dragleave', handleGlobalDragLeave);
            document.removeEventListener('dragover', handleGlobalDragOver);
            document.removeEventListener('drop', handleGlobalDrop);
        };
    }, [currentStep]);

    const handleDragOver = (e) => {
        e.preventDefault();
        if (currentStep === 0) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        
        if (currentStep !== 0) return;
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            handleMultipleFileUpload(imageFiles);
        }
    };

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
        });
      };

    const handleMultipleFileUpload = async (files) => {
        const newFiles = await Promise.all(
            files.map(async (file) => ({
              id: Date.now() + Math.random(),
              name: file.name,
              size: file.size,
              preview: await fileToBase64(file),
              title: '',
              description: '',
              link: '',
              hashtags: ''
            }))
          );
        
        setUploadedFiles(prev => {
            const updatedFiles = [...prev, ...newFiles];
            
            if (prev.length === 0 && newFiles.length > 0) {
                setTimeout(() => setCurrentStep(1), 500);
            }
            return updatedFiles;
        });
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleMultipleFileUpload(files);
        }
        e.target.value = '';
    };

    const handleRemoveFile = (fileId) => {
        setUploadedFiles(prev => {
            const updated = prev.filter(f => f.id !== fileId);
            const fileToRemove = prev.find(f => f.id === fileId);
            if (fileToRemove) {
                URL.revokeObjectURL(fileToRemove.preview);
            }
            
            if (updated.length === 0) {
                setCurrentStep(0);
            }
            
            if (selectedImageIndex >= updated.length && updated.length > 0) {
                setSelectedImageIndex(0);
            }
            
            return updated;
        });
    };

    const handleAddMoreImages = () => {
        addMoreInputRef.current?.click();
    };

    const handleAddMoreInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            handleMultipleFileUpload(files);
        }
        e.target.value = '';
    };

    const handleInputChange = (field, value) => {
        setUploadedFiles(prev => {
            const updatedFiles = [...prev];
            if (updatedFiles[selectedImageIndex]) {
                updatedFiles[selectedImageIndex] = {
                    ...updatedFiles[selectedImageIndex],
                    [field]: value
                };
            }
            return updatedFiles;
        });
    };

    const handleDeleteImage = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (uploadedFiles.length > 0) {
            handleRemoveFile(uploadedFiles[selectedImageIndex].id);
        }
        setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const handleNext = () => {
        if (isFormValid) {
          console.log('Next clicked - form is valid');
          console.log('All images with their texts:', uploadedFiles);
          setCurrentStep(2);
        }
      };

    const handleSaveFromUrl = () => {
        console.log('Save from URL clicked');
    };

    const handleBoardSelect = (board) => {
        setSelectedBoard(board);
    };

    const handlePublish = () => {
        const file = uploadedFiles[selectedImageIndex];
        if (!file.title || !file.description || !file.link || !file.hashtags) {
          setCurrentStep(1);
        } else if (!selectedBoard) {
          console.log("Please select a board");
          return;
        } else {
          console.log("Publishing to board:", selectedBoard.name, "File:", file);
          setCurrentStep(3);
        }
    };

    const handleDone = () => {
        if (uploadedFiles.length > 0) {
          const fileId = uploadedFiles[selectedImageIndex]?.id;
          if (fileId) {
            handleRemoveFile(fileId);
          }
        }
      
        setUploadedFiles(prev => {
          if (prev.length === 0) {
            setSelectedBoard(null);
            setCurrentStep(0);
            setSelectedImageIndex(0);
            localStorage.removeItem('aestData');
            return prev;
          } else {
            setSelectedImageIndex(0); 
            setCurrentStep(1);
            return prev;
          }
        });
      };

    const handleView = () => {
        console.log("View aest");
    };

    const renderDeleteModal = () => (
        <Modal
            open={showDeleteModal}
            onClose={handleCancelDelete}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 300,
                sx: {
                    backgroundColor: 'rgba(1, 35, 63, 0.20)',
                }
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 530,
                    height: 290,
                    boxShadow:'-1px 10px 16px 1px rgba(1, 35, 63, 0.25)',
                    backgroundColor: 'white',
                    borderRadius: '40px',
                    padding: '32px',
                    gap:'32px',
                    outline: 'none',
                    textAlign: 'center',
                    fontFamily: 'Geologica, sans-serif',
                }}
            >
                <Typography
                    sx={{
                        fontSize: '38px',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        mb: 4,
                        fontFamily: 'Geologica, sans-serif',
                    }}
                >
                    Delete image?
                </Typography>
                
                <Typography
                    sx={{
                        fontSize: '21px',
                        fontWeight: 400,
                        color: theme.palette.text.primary,
                        mb: 5,
                        fontFamily: 'Geologica, sans-serif',
                    }}
                >
                    Your progress will be lost.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                    <Button
                        onClick={handleCancelDelete}
                        sx={{
                            borderRadius: '100px',
                            textTransform: 'none',
                            fontSize: '21px',
                            fontWeight: 400,
                            width:'220px',
                            height:'58px',
                            px: 4,
                            py: 1.5,
                            backgroundColor: theme.palette.blue[50],
                            color: theme.palette.text.primary,
                            fontFamily: 'Geologica, sans-serif',
                        }}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        onClick={handleConfirmDelete}
                        sx={{
                            borderRadius: '100px',
                            textTransform: 'none',
                            fontSize: '21px',
                            width:'220px',
                            height:'58px',
                            fontWeight: 400,
                            px: 4,
                            py: 1.5,
                            backgroundColor: '#E62C2F',
                            color: 'white',
                            fontFamily: 'Geologica, sans-serif',
                        }}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>
        </Modal>
    );

    const renderUploadStep = () => (
        <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8 ,fontFamily: 'Geologica',}}>
            {dragOverAnimation && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.2s ease-in-out',
                        '@keyframes fadeIn': {
                            from: { opacity: 0 },
                            to: { opacity: 1 }
                        }
                    }}
                />
            )}

            <Paper
                elevation={0}
                sx={{
                    width: '490px',
                    height: '500px',
                    backgroundColor: isDragOver ? '#e8f0fe' : '#E8EDF9',
                    borderRadius: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isDragOver ? '3px dashed #3b82f6' : '2px dashed transparent',
                    mb: 4,
                    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isDragOver ? '0 8px 32px rgba(59, 130, 246, 0.2)' : 'none',
                    '&:hover': {
                        backgroundColor: '#dde4f0',
                        transform: 'scale(1.01)'
                    }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleFileSelect}
            >
                <Box
                    sx={{
                        mb: 3,
                        transform: isDragOver ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
                        transition: 'transform 0.2s ease',
                        opacity: isDragOver ? 1 : 0.8
                    }}
                >
                    <Iconify 
                        icon="octicon:upload-24" 
                        width={40} 
                        height={40}
                        color={theme.palette.text.primary}
                    />
                </Box>
                
                <Typography 
                    sx={{ 
                        color: theme.palette.blue[900],
                        fontWeight: 500,
                        fontSize: '21px',
                        mb: 1,
                        fontFamily: 'Geologica',
                    }}
                >
                    Choose a file
                </Typography>
                
                <Typography 
                    sx={{ 
                        color: theme.palette.text.primary,
                        fontWeight: 300,
                        fontSize: '21px',
                        mb: 2,
                        fontFamily: 'Geologica, sans-serif'
                    }}
                >
                    or drag and drop it here
                </Typography>
                
                <Typography 
                    sx={{ 
                        fontWeight: 300,
                        fontSize: '16px',
                        color: theme.palette.dark[300],
                        fontFamily: 'Geologica, sans-serif'
                    }}
                >
                    .jpg files less than 20 MB recommended
                </Typography>
            </Paper>

            <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.webp"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
            />

            <Typography 
                sx={{ 
                    color: theme.palette.text.primary,
                    fontWeight: 700,
                    fontSize: '21px',
                    mb: 2,
                    fontFamily: 'Geologica, sans-serif'
                }}
            >
                OR
            </Typography>

            <Button
                variant="text"
                onClick={handleSaveFromUrl}
                sx={{
                    color: theme.palette.dark[500],
                    textTransform: 'none',
                    fontSize: '21px',
                    fontWeight: 500,
                    gap:'10px',
                    fontFamily: 'Geologica, sans-serif',
                    
                    '&:hover': {
                        backgroundColor: 'transparent',
                    }
                }}
            >
                Save from URL
            </Button>
        </Container>
    );

    const renderAestInfoStep = () => {
        const currentFile = uploadedFiles[selectedImageIndex];
        
        return (
            <Container sx={{ pt: 4, pb: '140px' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width:'400px', height:'650px' }}>
                        {currentFile && (
                            <Paper
                                sx={{
                                    borderRadius: '40px',
                                    overflow: 'hidden',
                                    aspectRatio: '3/4',
                                    background: '#f5f5f5',
                                    width: '400px',
                                    height: '650px',
                                    boxShadow: 'none'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={currentFile.preview}
                                    alt={currentFile.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Paper>
                        )}
                    </Box>

                    <Box maxHeight={'650px '} sx={{ width:'690px' }}>
                        <Paper
                            sx={{
                                height:'650px',
                                borderRadius: '40px',
                                padding: '32px',
                                boxShadow: 'none',
                                border: '1px solid #B4C6EB'
                            }}
                        >
                            <Typography 
                                sx={{ 
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    fontSize: '28px',
                                    color: theme.palette.text.primary,
                                    mb: 2,
                                }}
                            >
                                Aest info
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box>
                                    <Typography
                                        sx={{ 
                                            mb: 1, 
                                            ml: 2,
                                            fontWeight: 300,
                                            fontSize: '15px',
                                            color: theme.palette.dark[500],
                                        }}
                                    >
                                        Title
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Add a title"
                                        value={currentFile?.title || ''}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '100px',
                                                backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                                border: 'none',
                                                fontWeight: 400,
                                                fontSize: '18px',
                                                paddingLeft: '10px',
                                                '& fieldset': {
                                                    border: 'none'
                                                },
                                                '&:hover fieldset': {
                                                    border: 'none'
                                                },
                                                '& input': {
                                                    paddingLeft: '14px',
                                                }
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: theme.palette.dark[200],
                                                opacity: 1,
                                                paddingLeft: '0px',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography 
                                        sx={{ 
                                            mb: 1, 
                                            ml: 2,
                                            fontWeight: 300,
                                            fontSize: '15px',
                                            color: theme.palette.dark[500],
                                        }}
                                    >
                                        Description
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={3}
                                        placeholder="Add a detailed description"
                                        value={currentFile?.description || ''}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '40px',
                                                backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                                border: 'none',
                                                fontWeight: 400,
                                                fontSize: '18px',
                                                paddingLeft: '10px',
                                                '& fieldset': {
                                                    border: 'none'
                                                },
                                                '&:hover fieldset': {
                                                    border: 'none'
                                                },
                                                '& textarea': {
                                                    paddingLeft: '14px',
                                                }
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: theme.palette.dark[200],
                                                opacity: 1,
                                                paddingLeft: '0px',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography 
                                        sx={{ 
                                            mb: 1, 
                                            ml: 2,
                                            fontWeight: 300,
                                            fontSize: '15px',
                                            color: theme.palette.dark[500],
                                        }}
                                    >
                                        Link
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Add a link"
                                        value={currentFile?.link || ''}
                                        onChange={(e) => handleInputChange('link', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '100px',
                                                backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                                border: 'none',
                                                fontWeight: 400,
                                                fontSize: '18px',
                                                paddingLeft: '10px',
                                                '& fieldset': {
                                                    border: 'none'
                                                },
                                                '&:hover fieldset': {
                                                    border: 'none'
                                                },
                                                '& input': {
                                                    paddingLeft: '14px',
                                                }
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: theme.palette.dark[200],
                                                opacity: 1,
                                                paddingLeft: '0px',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box>
                                    <Typography 
                                        sx={{ 
                                            mb: 1, 
                                            ml: 2,
                                            fontWeight: 300,
                                            fontSize: '15px',
                                            color: theme.palette.dark[500],
                                        }}
                                    >
                                        Hashtags
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Hashtags"
                                        value={currentFile?.hashtags || ''}
                                        onChange={(e) => handleInputChange('hashtags', e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '100px',
                                                backgroundColor: 'rgba(215, 224, 244, 0.50)',
                                                border: 'none',
                                                fontWeight: 400,
                                                mb: 2,
                                                fontSize: '18px',
                                                paddingLeft: '10px',
                                                '& fieldset': {
                                                    border: 'none'
                                                },
                                                '&:hover fieldset': {
                                                    border: 'none'
                                                },
                                                '& input': {
                                                    paddingLeft: '14px',
                                                }
                                            },
                                            '& .MuiInputBase-input::placeholder': {
                                                color: theme.palette.dark[200],
                                                opacity: 1,
                                                paddingLeft: '0px',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 4 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleDeleteImage}
                                        sx={{
                                            borderRadius: '100px',
                                            textTransform: 'none',
                                            width:'300px',
                                            fontWeight: 400,
                                            fontSize: '18px',
                                            backgroundColor: theme.palette.blue[50],
                                            color: theme.palette.text.primary,
                                            border: 'none',
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: '#B5BFD1',
                                                border: 'none'
                                            }
                                        }}
                                    >
                                        Delete image
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={!isFormValid}
                                        sx={{
                                            borderRadius: '100px',
                                            textTransform: 'none',
                                            width:'300px',
                                            fontWeight: 400,
                                            fontSize: '18px',
                                            backgroundColor: isFormValid ? '#6F91D9' : '#CBD7F1',
                                            color: isFormValid ? 'white' : 'white',
                                            boxShadow: 'none',
                                            transition: 'all 0.3s ease',
                                            cursor: isFormValid ? 'pointer' : 'not-allowed',
                                            '&:hover': {
                                                boxShadow: isFormValid ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
                                            },
                                            '&:disabled': {
                                                backgroundColor: '#CBD7F1',
                                                color: 'white'
                                            }
                                        }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Box>

                <input
                    ref={addMoreInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleAddMoreInputChange}
                />
                <Box sx={{ 
                    position: 'fixed',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: '20px', 
                    backgroundColor: 'white',
                    borderRadius: '40px 40px 0 0',
                    padding: '24px 32px',
                    boxShadow: ' 0 -5px 14px 0 rgba(111, 145, 217, 0.25)',
                    zIndex: 1000,
                }}>
                    {uploadedFiles.map((file, index) => (
                        <Box
                            key={file.id}
                            onClick={() => setSelectedImageIndex(index)}
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '16px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: selectedImageIndex === index ? '3px solid #3B82F6' : 'none',
                                transition: 'all 0.3s ease',
                                flexShrink: 0,
                                position: 'relative',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src={file.preview}
                                alt={file.name}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {file.title && file.description && file.link && file.hashtags && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: '#4CAF50',
                                        border: '2px solid white'
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                    
                    <Box
                        onClick={handleAddMoreImages}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            backgroundColor: '#EAEFF9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                            }
                        }}
                    >
                        <Iconify color={theme.palette.dark[500]} icon="octicon:plus-24" width={32} height={32} />
                    </Box>
                </Box>
            </Container>
        );
    };

    const renderChooseBoardStep = () => {
        const currentFile = uploadedFiles[selectedImageIndex];
      
        return (
            <Container sx={{ pt: 4, pb: "140px" }}>
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ width: "400px", height: "650px" }}>
                  {currentFile && (
                    <Paper
                      sx={{
                        borderRadius: "40px",
                        overflow: "hidden",
                        background: "#f5f5f5",
                        width: "400px",
                        height: "650px",
                        boxShadow: "none",
                      }}
                    >
                      <Box
                        component="img"
                        src={currentFile.preview}
                        alt={currentFile.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Paper>
                  )}
                </Box>
          
                <Box maxHeight={"650px"} sx={{ width: "690px" }}>
                  <Paper
                    sx={{
                      height: "650px",
                      borderRadius: "40px",
                      padding: "32px",
                      boxShadow: "none",
                      border: "1px solid #B4C6EB",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "28px",
                        fontStyle:'semibold',
                        color: theme.palette.text.primary,
                        mb: 5,
                        fontFamily: "Geologica, sans-serif",
                      }}
                    >
                      Choose a board
                    </Typography>
          
                    <Box
                      sx={{
                        flexGrow: 1,
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        px: 1,
                        pr: 2,
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          backgroundColor: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#C4C4C4",
                          borderRadius: "3px",
                          "&:hover": {
                            backgroundColor: "#A0A0A0",
                          },
                        },
                      }}
                    >
                      <Box 
                        onClick={() => handleBoardSelect({ name: "Create new board", isNew: true })}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '16px',
                          backgroundColor: selectedBoard?.isNew ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          border: selectedBoard?.isNew ? '2px solid #3B82F6' : '2px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.05)'
                          }
                        }}
                      >
                          <Box
                              sx={{
                              width: 54,
                              height: 54,
                              borderRadius: '16px',
                              backgroundColor: '#EAEFF9',
                              display: 'flex',
                              alignItems: 'center',
                              gap:'24px',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.3s ease',
                              mr:1,
                              }}
                          >
                              <Iconify color={theme.palette.dark[500]} icon="octicon:plus-24" width={32} height={32} />
                          </Box>
                          <Typography
                              sx={{
                              fontWeight: 600,
                              color: theme.palette.dark[500],
                              fontSize: '18px',
                              fontStyle:'semibold',
                              }}
                          >
                              Create new board
                          </Typography>
                      </Box>
                      
          
                      <Box 
                        onClick={() => handleBoardSelect({ name: "Save to profile", isProfile: true })}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          cursor: 'pointer',
                          padding: '8px',
                          borderRadius: '16px',
                          backgroundColor: selectedBoard?.isProfile ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          border: selectedBoard?.isProfile ? '2px solid #3B82F6' : '2px solid transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(59, 130, 246, 0.05)'
                          }
                        }}
                      >
                          <Box
                              sx={{
                              width: 54,
                              height: 54,
                              borderRadius: '16px',
                              backgroundColor: '#EAEFF9',
                              display: 'flex',
                              alignItems: 'center',
                              gap:'24px',
                              justifyContent: 'center',
                              flexShrink: 0,
                              transition: 'all 0.3s ease',
                              mr:1,
                              }}
                          >
                              <Iconify color={theme.palette.dark[500]} icon="octicon:person-24" width={32} height={32} />
                          </Box>
                          <Typography
                              sx={{
                              fontWeight: 600,
                              color: theme.palette.dark[500],
                              fontSize: '18px',
                              fontStyle:'semibold',
                              }}
                          >
                              Save to profile
                          </Typography>
                      </Box>
                      <Box
                      component="hr"
                      sx={{
                          mt:1,
                          border: 'none',
                          borderTop: `1px solid ${theme.palette.blue[50]}`,
                      }}
                      />
          
                      {boards.map((board, index) => (
                        <Box 
                          key={index} 
                          onClick={() => handleBoardSelect(board)}
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '16px',
                            backgroundColor: selectedBoard?.name === board.name ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                            border: selectedBoard?.name === board.name ? '2px solid #3B82F6' : '2px solid transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(59, 130, 246, 0.05)'
                            }
                          }}
                        >
                            <Box
                                sx={{
                                width: 54,
                                height: 54,
                                borderRadius: '16px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                mr:1,
                                }}
                            >
                                <Box
                                    component="img"
                                    src={board.image}
                                    alt={board.name}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography
                                    sx={{
                                    fontWeight: 600,
                                    color: theme.palette.dark[500],
                                    fontSize: '18px',
                                    fontStyle:'semibold',
                                    lineHeight: 1.2,
                                    }}
                                >
                                    {board.name}
                                </Typography>
                                <Typography
                                    sx={{
                                    fontWeight: 400,
                                    color: theme.palette.text.secondary,
                                    fontSize: '14px',
                                    lineHeight: 1.2,
                                    }}
                                >
                                    {board.count}
                                </Typography>
                            </Box>
                            {board.isPrivate && (
                              <Box sx={{ ml: 'auto' }}>
                                <Iconify color={theme.palette.text.secondary} icon="material-symbols:lock" width={20} height={20} />
                              </Box>
                            )}
                        </Box>
                      ))}
                    </Box>
          
                    <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentStep(1)}
                        sx={{
                          borderRadius: "100px",
                          textTransform: "none",
                          width: "300px",
                          fontWeight: 400,
                          fontSize: "18px",
                          backgroundColor: theme.palette.blue[50],
                          color: theme.palette.text.primary,
                          border: "none",
                          px: 3,
                          py: 1.5,
                          "&:hover": {
                            backgroundColor: "#B5BFD1",
                            border: "none",
                          },
                        }}
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={!selectedBoard}
                        sx={{
                          borderRadius: "100px",
                          textTransform: "none",
                          width: "300px",
                          fontWeight: 400,
                          fontSize: "18px",
                          backgroundColor: selectedBoard ? "#6F91D9" : "#CBD7F1",
                          color: "white",
                          boxShadow: "none",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: selectedBoard ? "0 4px 12px rgba(59, 130, 246, 0.4)" : "none",
                          },
                          "&:disabled": {
                            backgroundColor: "#CBD7F1",
                            color: "white"
                          }
                        }}
                      >
                        Publish
                      </Button>
                    </Box>
                  </Paper>
                </Box>
              </Box>

              <Box
                sx={{
                  position: "fixed",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  backgroundColor: "white",
                  borderRadius: "40px 40px 0 0",
                  padding: "24px 32px",
                  boxShadow: " 0 -5px 14px 0 rgba(111, 145, 217, 0.25)",
                  zIndex: 1000,
                }}
              >
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={file.id}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      if (!file.title || !file.description || !file.link || !file.hashtags) {
                        setCurrentStep(1);
                      }
                    }}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: selectedImageIndex === index ? "3px solid #3B82F6" : "none",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={file.preview}
                      alt={file.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {file.title && file.description && file.link && file.hashtags && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#4CAF50",
                          border: "2px solid white",
                        }}
                      />
                    )}
                  </Box>
                ))}
                <Box
                          onClick={handleAddMoreImages}
                          sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '16px',
                              backgroundColor: '#EAEFF9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              flexShrink: 0,
                              transition: 'all 0.3s ease',
                              
                              '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                              }
                          }}
                      >
                           <Iconify color={theme.palette.dark[500]} icon="octicon:plus-24" width={32} height={32} />
                      </Box>
              </Box>
            </Container>
          );
      };

    const renderSuccessStep = () => {
        const currentFile = uploadedFiles[selectedImageIndex];
        
        return (
            <Container sx={{ pt: 4, pb: "140px" }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", minHeight: "650px" }}>
                    <Box sx={{ width: "400px", height: "650px" }}>
                        {currentFile && (
                            <Paper
                                sx={{
                                    borderRadius: "40px",
                                    overflow: "hidden",
                                    background: "#f5f5f5",
                                    width: "400px",
                                    height: "650px",
                                    boxShadow: "none",
                                }}
                            >
                                <Box
                                    component="img"
                                    src={currentFile.preview}
                                    alt={currentFile.name}
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Paper>
                        )}
                    </Box>

                    <Box maxHeight={"320px"} sx={{ width: "620px"}}>
                        <Paper
                            sx={{
                                height: "320px",
                                borderRadius: "40px",
                                padding: "32px",
                                boxShadow: "none",
                                border: "1px solid #B4C6EB",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography
                                sx={{
                                    textAlign: "center",
                                    fontWeight: 700,
                                    fontSize: "32px",
                                    color: theme.palette.text.primary,
                                    mb: 2,
                                    fontFamily: "Geologica, sans-serif",
                                }}
                            >
                                Great!
                            </Typography>

                            <Typography
                                sx={{
                                    textAlign: "center",
                                    fontSize: "18px",
                                    fontWeight: 400,
                                    color: theme.palette.text.primary,
                                    mb: 4,
                                    fontFamily: "Geologica, sans-serif",
                                }}
                            >
                                Your Aest has been successfully created and saved in
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "start", mb: 4, ml: 2 }}>
                                <Box
                                    sx={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: "16px",
                                        overflow: "hidden",
                                        flexShrink: 0,
                                    }}
                                >
                                    {selectedBoard?.image ? (
                                        <Box
                                            component="img"
                                            src={selectedBoard.image}
                                            alt={selectedBoard.name}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                backgroundColor: "#EAEFF9",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Iconify 
                                                color={theme.palette.dark[500]} 
                                                icon={selectedBoard?.isProfile ? "octicon:person-24" : "octicon:plus-24"} 
                                                width={24} 
                                                height={24} 
                                            />
                                        </Box>
                                    )}
                                </Box>
                                <Box sx={{ textAlign: "left" }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            color: theme.palette.text.primary,
                                            fontSize: "18px",
                                            lineHeight: 1.2,
                                            fontFamily: "Geologica, sans-serif",
                                        }}
                                    >
                                        {selectedBoard?.name || "Selected board"}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: 400,
                                            color: theme.palette.text.secondary,
                                            fontSize: "14px",
                                            lineHeight: 1.2,
                                            fontFamily: "Geologica, sans-serif",
                                        }}
                                    >
                                        {selectedBoard?.count || "Aests"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                                <Button
                                    onClick={handleDone}
                                    sx={{
                                        borderRadius: "100px",
                                        textTransform: "none",
                                        fontSize: "18px",
                                        fontWeight: 400,
                                        width: "250px",
                                        height: "50px",
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: theme.palette.blue[50],
                                        color: theme.palette.text.primary,
                                        fontFamily: "Geologica, sans-serif",
                                        border: "none",
                                        "&:hover": {
                                            backgroundColor: "#B5BFD1",
                                        },
                                    }}
                                >
                                    Done
                                </Button>

                                <Button
                                    onClick={handleView}
                                    sx={{
                                        borderRadius: "100px",
                                        textTransform: "none",
                                        fontSize: "18px",
                                        fontWeight: 400,
                                        width: "250px",
                                        height: "50px",
                                        px: 3,
                                        py: 1.5,
                                        backgroundColor: "#6F91D9",
                                        color: "white",
                                        boxShadow: "none",
                                        fontFamily: "Geologica, sans-serif",
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                                        },
                                    }}
                                >
                                    View
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Box>

                <Box
                sx={{
                  position: "fixed",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  justifyContent: "center",
                  gap: "20px",
                  backgroundColor: "white",
                  borderRadius: "40px 40px 0 0",
                  padding: "24px 32px",
                  boxShadow: " 0 -5px 14px 0 rgba(111, 145, 217, 0.25)",
                  zIndex: 1000,
                }}
              >
                {uploadedFiles.map((file, index) => (
                  <Box
                    key={file.id}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      if (!file.title || !file.description || !file.link || !file.hashtags) {
                        setCurrentStep(1);
                      }
                    }}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: selectedImageIndex === index ? "3px solid #3B82F6" : "none",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={file.preview}
                      alt={file.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {file.title && file.description && file.link && file.hashtags && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: "#4CAF50",
                          border: "2px solid white",
                        }}
                      />
                    )}
                  </Box>
                ))}
                <Box
                        onClick={handleAddMoreImages}
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            backgroundColor: '#EAEFF9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                            transition: 'all 0.3s ease',
                            
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
                            }
                        }}
                    >
                           <Iconify color={theme.palette.dark[500]} icon="octicon:plus-24" width={32} height={32} />
                      </Box>
              </Box>
            </Container>
        );
    };

    return (
        <>
            <SimpleHeader title="Create Aest" />
            <Box sx={{ minHeight: '100%', backgroundColor: '#FFFFFF' }}>
                {currentStep === 0 && renderUploadStep()}
                {currentStep === 1 && renderAestInfoStep()}
                {currentStep === 2 && renderChooseBoardStep()}
                {currentStep === 3 && renderSuccessStep()}
                {renderDeleteModal()}
            </Box>
        </>
    );
};

export default CreateAest