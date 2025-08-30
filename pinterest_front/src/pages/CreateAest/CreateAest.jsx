import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import SimpleHeader from '../../components/layout/SimpleHeader';
import { useTheme } from '@mui/material';
import { Icon as Iconify } from '@iconify/react';

import ImageThumbnailBar from '../../components/ui/CreateAestComponents/ImageThumbnailBar';
import ImagePreview from '../../components/ui/CreateAestComponents/ImagePreview';
import StyledTextField from '../../components/ui/CreateAestComponents/StyledTextField';
import ActionButton from '../../components/ui/CreateAestComponents/ActionButton';
import DeleteModal from '../../components/ui/CreateAestComponents/DeleteModal';
import BoardList from '../../components/ui/CreateAestComponents/BoardList';
import UploadStep from '../../components/ui/CreateAestComponents/UploadStep';

const CreateAest = () => {
    const user = useCurrentUser();
    const theme = useTheme();
  
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
    const dragCountRef = useRef(0);
  
    const isFormValid = uploadedFiles.length > 0 && 
      uploadedFiles[selectedImageIndex]?.title?.trim() && 
      uploadedFiles[selectedImageIndex]?.description?.trim() && 
      uploadedFiles[selectedImageIndex]?.link?.trim() && 
      uploadedFiles[selectedImageIndex]?.hashtags?.trim();
  
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
  
    const handleImageSelect = (index) => {
      setSelectedImageIndex(index);
      if (currentStep === 2) {
        const file = uploadedFiles[index];
        if (!file.title || !file.description || !file.link || !file.hashtags) {
          setCurrentStep(1);
        }
      }
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
  

    const renderUploadStep = () => (
      <UploadStep 
        isDragOver={isDragOver}
        dragOverAnimation={dragOverAnimation}
        onFileSelect={handleFileSelect}
        onSaveFromUrl={handleSaveFromUrl}
        fileInputRef={fileInputRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
      />
    );
  
    const renderAestInfoStep = () => {
      const currentFile = uploadedFiles[selectedImageIndex];
      
      return (
        <Container sx={{ pt: 4, pb: '140px' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <ImagePreview file={currentFile} />
  
            <Box maxHeight={'650px'} sx={{ width: '690px' }}>
              <Paper sx={{
                height: '650px', borderRadius: '40px', padding: '32px',
                boxShadow: 'none', border: '1px solid #B4C6EB'
              }}>
                <Typography sx={{ 
                  textAlign: 'center', fontWeight: 600, fontSize: '28px',
                  color: theme.palette.text.primary, mb: 2 
                }}>
                  Aest info
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <StyledTextField
                    label="Title"
                    placeholder="Add a title"
                    value={currentFile?.title || ''}
                    onChange={(value) => handleInputChange('title', value)}
                  />
                  
                  <StyledTextField
                    label="Description"
                    placeholder="Add a detailed description"
                    value={currentFile?.description || ''}
                    onChange={(value) => handleInputChange('description', value)}
                    multiline={true}
                    rows={3}
                  />
                  
                  <StyledTextField
                    label="Link"
                    placeholder="Add a link"
                    value={currentFile?.link || ''}
                    onChange={(value) => handleInputChange('link', value)}
                  />
                  
                  <StyledTextField
                    label="Hashtags"
                    placeholder="Hashtags"
                    value={currentFile?.hashtags || ''}
                    onChange={(value) => handleInputChange('hashtags', value)}
                  />
  
                  <Box sx={{ display: 'flex', gap: 4,mt:2 }}>
                    <ActionButton 
                      onClick={handleDeleteImage}
                      color="secondary"
                    >
                      Delete image
                    </ActionButton>
                    <ActionButton 
                      onClick={handleNext}
                      disabled={!isFormValid}
                    >
                      Next
                    </ActionButton>
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
          
          <ImageThumbnailBar
            uploadedFiles={uploadedFiles}
            selectedImageIndex={selectedImageIndex}
            onImageSelect={handleImageSelect}
            onAddMoreImages={handleAddMoreImages}
          />
        </Container>
      );
    };
  
    const renderChooseBoardStep = () => {
      const currentFile = uploadedFiles[selectedImageIndex];
  
      return (
        <Container sx={{ pt: 4, pb: "140px" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <ImagePreview file={currentFile} />
  
            <Box maxHeight={"650px"} sx={{ width: "690px" }}>
              <Paper sx={{
                height: "650px", borderRadius: "40px", padding: "32px",
                boxShadow: "none", border: "1px solid #B4C6EB",
                display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}>
                <Typography sx={{
                  textAlign: "center", fontWeight: 600, fontSize: "28px",
                  fontStyle: 'semibold', color: theme.palette.text.primary, mb: 5,
                  fontFamily: "Geologica, sans-serif"
                }}>
                  Choose a board
                </Typography>
  
                <BoardList
                  boards={boards}
                  selectedBoard={selectedBoard}
                  onBoardSelect={handleBoardSelect}
                />
  
                <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
                  <ActionButton 
                    onClick={() => setCurrentStep(1)}
                    color="secondary"
                  >
                    Back
                  </ActionButton>
                  <ActionButton 
                    onClick={handlePublish}
                    disabled={!selectedBoard}
                  >
                    Publish
                  </ActionButton>
                </Box>
              </Paper>
            </Box>
          </Box>
  
          <ImageThumbnailBar
            uploadedFiles={uploadedFiles}
            selectedImageIndex={selectedImageIndex}
            onImageSelect={handleImageSelect}
            onAddMoreImages={handleAddMoreImages}
          />
        </Container>
      );
    };
  
    const renderSuccessStep = () => {
      const currentFile = uploadedFiles[selectedImageIndex];
      
      return (
        <Container sx={{ pt: 4, pb: "140px" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center", minHeight: "650px" }}>
            <ImagePreview file={currentFile} />
  
            <Box maxHeight={"320px"} sx={{ width: "620px"}}>
              <Paper sx={{
                height: "320px", borderRadius: "40px", padding: "32px",
                boxShadow: "none", border: "1px solid #B4C6EB",
                display: "flex", flexDirection: "column", justifyContent: "space-between"
              }}>
                <Typography sx={{
                  textAlign: "center", fontWeight: 700, fontSize: "32px",
                  color: theme.palette.text.primary, mb: 2,
                  fontFamily: "Geologica, sans-serif"
                }}>
                  Great!
                </Typography>
  
                <Typography sx={{
                  textAlign: "center", fontSize: "18px", fontWeight: 400,
                  color: theme.palette.text.primary, mb: 4,
                  fontFamily: "Geologica, sans-serif"
                }}>
                  Your Aest has been successfully created and saved in
                </Typography>
  
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "start", mb: 4, ml: 2 }}>
                  <Box sx={{
                    width: 54, height: 54, borderRadius: "16px",
                    overflow: "hidden", flexShrink: 0
                  }}>
                    {selectedBoard?.image ? (
                      <Box
                        component="img"
                        src={selectedBoard.image}
                        alt={selectedBoard.name}
                        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Box sx={{
                        width: "100%", height: "100%", backgroundColor: "#EAEFF9",
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <Iconify 
                          color={theme.palette.dark[500]} 
                          icon={selectedBoard?.isProfile ? "octicon:person-24" : "octicon:plus-24"} 
                          width={24} height={24} 
                        />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ textAlign: "left" }}>
                    <Typography sx={{
                      fontWeight: 600, color: theme.palette.text.primary,
                      fontSize: "18px", lineHeight: 1.2,
                      fontFamily: "Geologica, sans-serif"
                    }}>
                      {selectedBoard?.name || "Selected board"}
                    </Typography>
                    <Typography sx={{
                      fontWeight: 400, color: theme.palette.text.secondary,
                      fontSize: "14px", lineHeight: 1.2,
                      fontFamily: "Geologica, sans-serif"
                    }}>
                      {selectedBoard?.count || "Aests"}
                    </Typography>
                  </Box>
                </Box>
  
                <Box sx={{ display: "flex", gap: 3, justifyContent: "center" }}>
                  <ActionButton 
                    onClick={handleDone}
                    color="secondary"
                    width="250px"
                  >
                    Done
                  </ActionButton>
                  <ActionButton 
                    onClick={handleView}
                    width="250px"
                  >
                    View
                  </ActionButton>
                </Box>
              </Paper>
            </Box>
          </Box>
  
          <ImageThumbnailBar
            uploadedFiles={uploadedFiles}
            selectedImageIndex={selectedImageIndex}
            onImageSelect={handleImageSelect}
            onAddMoreImages={handleAddMoreImages}
          />
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
          
          <DeleteModal
            open={showDeleteModal}
            onClose={handleCancelDelete}
            onConfirm={handleConfirmDelete}
          />
        </Box>
      </>
    );
  };
  
  export default CreateAest;