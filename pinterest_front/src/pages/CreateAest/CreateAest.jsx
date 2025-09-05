import React, { useState, useEffect, useRef } from 'react';
import { Box, Container, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
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

import { useGetUserBoardsQuery, useCreateBoardMutation } from '../../../store/Boards/BoardsApi';
import { useCreatePinMutation } from '../../../store/Pins/PinApi';

// CreateBoardModal component
const CreateBoardModal = ({ open, onClose, onConfirm, isLoading }) => {
  const [boardName, setBoardName] = useState('');
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (boardName.trim()) {
      onConfirm(boardName.trim());
      setBoardName('');
    }
  };

  const handleClose = () => {
    setBoardName('');
    onClose();
  };

  if (!open) return null;

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <Paper sx={{
        padding: '32px',
        borderRadius: '20px',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <Typography sx={{
          fontSize: '24px',
          fontWeight: 600,
          textAlign: 'center',
          mb: 3,
          color: theme.palette.text.primary
        }}>
          Create new board
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <StyledTextField
            label="Board name"
            placeholder="Enter board name"
            value={boardName}
            onChange={setBoardName}
            autoFocus={true}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <ActionButton
              onClick={handleClose}
              color="secondary"
              disabled={isLoading}
            >
              Cancel
            </ActionButton>
            <ActionButton
              onClick={() => handleSubmit({ preventDefault: () => {} })}
              disabled={!boardName.trim() || isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Create'}
            </ActionButton>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

class FileStorage {
  constructor() {
    this.dbName = 'CreateAestDB';
    this.version = 1;
    this.storeName = 'files';
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async saveFile(id, file, preview) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.put({
          id: id,
          file: file,
          preview: preview,
          name: file.name,
          size: file.size,
          type: file.type,
          timestamp: Date.now()
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
    } catch (error) {
      console.error('Error saving file to IndexedDB:', error);
    }
  }

  async getFile(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      return result;
    } catch (error) {
      console.error('Error getting file from IndexedDB:', error);
      return null;
    }
  }

  async deleteFile(id) {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error);
    }
  }

  async getAllFiles() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const result = await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      return result;
    } catch (error) {
      console.error('Error getting all files from IndexedDB:', error);
      return [];
    }
  }

  async clearAll() {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
    }
  }
}

const CreateAest = () => {
    const user = useCurrentUser();
    const theme = useTheme();
    
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [dragOverAnimation, setDragOverAnimation] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateBoardModal, setShowCreateBoardModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [aestInfo, setAestInfo] = useState({
      title: '',
      description: '',
      link: '',
      hashtags: ''
    });
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  
    const fileInputRef = useRef(null);
    const addMoreInputRef = useRef(null);
    const dragCountRef = useRef(0);
    const fileStorageRef = useRef(new FileStorage());

    const {
      data: boardsData,
      isLoading: boardsLoading,
      isError: boardsError,
      error: boardsErrorDetails,
      refetch: refetchBoards
    } = useGetUserBoardsQuery(
      {
        username: user?.username || user?.email,
      },
      {
        skip: !user || (!user.username && !user.email),
        refetchOnMountOrArgChange: true
      }
    );

    const [createBoard, { 
      isLoading: isCreatingBoard,
      isSuccess: isBoardCreated,
      error: boardCreationError 
    }] = useCreateBoardMutation();

    const [createPin, { 
      isLoading: isCreatingPin, 
      isSuccess: isPinCreated, 
      error: pinCreationError 
    }] = useCreatePinMutation();

    const boards = boardsData?.boards || [];
  
    const isFormValid = uploadedFiles.length > 0 && 
      uploadedFiles[selectedImageIndex]?.title?.trim() && 
      uploadedFiles[selectedImageIndex]?.description?.trim() && 
      uploadedFiles[selectedImageIndex]?.link?.trim() && 
      uploadedFiles[selectedImageIndex]?.hashtags?.trim();
  
    useEffect(() => {
      const loadSavedData = async () => {
        try {
          setIsLoadingFiles(true);
          
          const savedData = sessionStorage.getItem('aestData');
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            if (parsedData.uploadedFiles && parsedData.uploadedFiles.length > 0) {
              const restoredFiles = await Promise.all(
                parsedData.uploadedFiles.map(async (fileInfo) => {
                  const storedFile = await fileStorageRef.current.getFile(fileInfo.id);
                  
                  return {
                    ...fileInfo,
                    preview: storedFile ? storedFile.preview : null,
                    file: storedFile ? storedFile.file : null,
                    hasStoredFile: !!storedFile
                  };
                })
              );
              
              setUploadedFiles(restoredFiles);
              setAestInfo(parsedData.aestInfo || {
                title: '',
                description: '',
                link: '',
                hashtags: ''
              });
              setCurrentStep(parsedData.currentStep || 0);
              setSelectedImageIndex(Math.min(parsedData.selectedImageIndex || 0, restoredFiles.length - 1));
              setSelectedBoard(parsedData.selectedBoard || null);
            }
          }
        } catch (error) {
          console.error('Error loading saved data:', error);
        } finally {
          setIsLoadingFiles(false);
        }
      };
      
      loadSavedData();
    }, []);
  
    useEffect(() => {
      if (!isLoadingFiles && uploadedFiles.length > 0) {
        try {
          const dataToSave = {
            uploadedFiles: uploadedFiles.map(file => ({
              id: file.id,
              name: file.name,
              size: file.size,
              title: file.title,
              description: file.description,
              link: file.link,
              hashtags: file.hashtags,
              hasStoredFile: file.hasStoredFile
            })),
            aestInfo,
            currentStep,
            selectedImageIndex,
            selectedBoard
          };
          sessionStorage.setItem('aestData', JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Error saving to sessionStorage:', error);
        }
      }
    }, [uploadedFiles, aestInfo, currentStep, selectedImageIndex, selectedBoard, isLoadingFiles]);
  
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
      try {
        const newFiles = await Promise.all(
          files.map(async (file) => {
            const fileId = Date.now() + Math.random();
            const preview = await fileToBase64(file);
            
            await fileStorageRef.current.saveFile(fileId, file, preview);
            
            return {
              id: fileId,
              name: file.name,
              size: file.size,
              preview: preview,
              file: file,
              title: '',
              description: '',
              link: '',
              hashtags: '',
              hasStoredFile: true
            };
          })
        );
        
        setUploadedFiles(prev => {
          const updatedFiles = [...prev, ...newFiles];
          
          if (prev.length === 0 && newFiles.length > 0) {
            setTimeout(() => setCurrentStep(1), 500);
          }
          return updatedFiles;
        });
      } catch (error) {
        console.error('Error uploading files:', error);
      }
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
  
    const handleRemoveFile = async (fileId) => {
      await fileStorageRef.current.deleteFile(fileId);
      
      setUploadedFiles(prev => {
        const updated = prev.filter(f => f.id !== fileId);
        
        if (updated.length === 0) {
          setCurrentStep(0);
          sessionStorage.removeItem('aestData');
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

    const handleRetryLoadBoards = () => {
      refetchBoards();
    };

    const handleCreateNewBoard = () => {
      setShowCreateBoardModal(true);
    };

    const handleConfirmCreateBoard = async (boardName) => {
      try {
        const boardData = {
          boardDto: {
            name: boardName,
            description: "",
            isPrivate: false
          }
        };
    
        console.log("Creating board with data:", boardData);
    
        const result = await createBoard(boardData).unwrap();
        console.log("Board created successfully:", result);
    
        await refetchBoards();
    
        const newBoard = {
          id: result.id,
          name: result.name,
          count: "0 Assets",
          image: null,
          isPrivate: result.isPrivate || false
        };
        setSelectedBoard(newBoard);
    
        setShowCreateBoardModal(false);
      } catch (error) {
        console.error("Error creating board:", error);
        console.error("Full error details:", JSON.stringify(error, null, 2));
        alert("Failed to create board. Please try again.");
      }
    };

    const handleCancelCreateBoard = () => {
      setShowCreateBoardModal(false);
    };

    const handlePublish = async () => {
      const fileInfo = uploadedFiles[selectedImageIndex];
      
      if (!fileInfo || !fileInfo.title || !fileInfo.description || !fileInfo.link || !fileInfo.hashtags) {
        alert("Please fill all required fields");
        setCurrentStep(1);
        return;
      }

      let file = fileInfo.file;
      if (!file) {
        const storedData = await fileStorageRef.current.getFile(fileInfo.id);
        if (!storedData) {
          alert("Image file is missing. Please upload the image again.");
          return;
        }
        file = storedData.file;
      }
      
      if (!selectedBoard) {
        alert("Please select a board");
        return;
      }
    
      const token = localStorage.getItem('authToken') || 
                   localStorage.getItem('token') || 
                   sessionStorage.getItem('authToken') || 
                   sessionStorage.getItem('token');
      
      if (!token) {
        alert("Authentication required. Please log in first.");
        return;
      }
    
      try {
        if (!file.type || !file.type.startsWith('image/')) {
          alert("Please select a valid image file");
          return;
        }

        const maxFileSize = 10 * 1024 * 1024;
        if (file.size && file.size > maxFileSize) {
          alert("File size must be less than 10MB");
          return;
        }
    
        const formData = new FormData();
        formData.append('Title', fileInfo.title.trim());
        formData.append('Description', fileInfo.description.trim());
        formData.append('Link', fileInfo.link.trim());
        formData.append('Tags', fileInfo.hashtags.trim());
        formData.append('ImageFile', file, file.name);
        
        if (!selectedBoard.isProfile && selectedBoard.id) {
          formData.append('BoardId', selectedBoard.id.toString());
        }

        console.log("Creating pin with FormData:");
        console.log("File details:", {
          name: file.name,
          type: file.type,
          size: file.size
        });

        const result = await createPin(formData).unwrap();
        console.log("Pin created successfully:", result);
        
        setCurrentStep(3);
      } catch (error) {
        console.error("Error creating pin:", error);
        
        let errorMessage = "Failed to create pin. Please try again.";
        
        if (error.status === 401) {
          errorMessage = "Authentication failed. Please log in again.";
        } else if (error.status === 400) {
          if (error.data && error.data.errors) {
            const validationErrors = error.data.errors;
            const errorMessages = [];
            
            Object.keys(validationErrors).forEach(field => {
              const fieldErrors = validationErrors[field];
              if (Array.isArray(fieldErrors)) {
                fieldErrors.forEach(err => {
                  errorMessages.push(`${field}: ${err}`);
                });
              }
            });
            
            if (errorMessages.length > 0) {
              errorMessage = `Validation errors:\n${errorMessages.join('\n')}`;
            }
          }
        } else if (error.status === 413) {
          errorMessage = "File is too large. Please select a smaller image.";
        } else if (error.status === 415) {
          errorMessage = "Unsupported file type. Please select a valid image file.";
        } else if (error.status === 403) {
          errorMessage = "You don't have permission to create pins.";
        }
        
        alert(errorMessage);
      }
    };
  
    const handleDone = async () => {
      if (uploadedFiles.length > 0) {
        const fileId = uploadedFiles[selectedImageIndex]?.id;
        if (fileId) {
          await handleRemoveFile(fileId);
        }
      }
    
      setUploadedFiles(prev => {
        if (prev.length === 0) {
          setSelectedBoard(null);
          setCurrentStep(0);
          setSelectedImageIndex(0);
          sessionStorage.removeItem('aestData');
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

    const handleClearAll = async () => {
      await fileStorageRef.current.clearAll();
      sessionStorage.removeItem('aestData');
      setUploadedFiles([]);
      setCurrentStep(0);
      setSelectedImageIndex(0);
      setSelectedBoard(null);
    };

    if (isLoadingFiles) {
      return (
        <>
          <SimpleHeader title="Create Aest" />
          <Box sx={{ minHeight: '100%', backgroundColor: '#FFFFFF' }}>
            <Container sx={{ pt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading saved files...</Typography>
              </Box>
            </Container>
          </Box>
        </>
      );
    }

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
      
      if (!currentFile) {
        return (
          <Container sx={{ pt: 4, pb: '140px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <Paper sx={{ padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
                <Typography sx={{ fontSize: '18px', mb: 2, color: theme.palette.text.primary }}>
                  Please upload your images to continue
                </Typography>
                <ActionButton onClick={() => setCurrentStep(0)}>
                  Upload Images
                </ActionButton>
              </Paper>
            </Box>
          </Container>
        );
      }
      
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
  
                  <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
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

                {boardsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                    <CircularProgress />
                  </Box>
                ) : boardsError ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 2 }}>
                    <Alert severity="error" sx={{ width: '100%' }}>
                      Failed to load boards: {boardsErrorDetails?.message || 'Unknown error'}
                    </Alert>
                    <Button onClick={handleRetryLoadBoards} variant="outlined">
                      Retry
                    </Button>
                  </Box>
                ) : (
                  <BoardList
                    boards={boards}
                    selectedBoard={selectedBoard}
                    onBoardSelect={handleBoardSelect}
                    boardsLoading={boardsLoading}
                    boardsError={boardsError}
                    onRetryLoadBoards={handleRetryLoadBoards}
                    onCreateNewBoard={handleCreateNewBoard}
                  />
                )}

                <Box sx={{ display: "flex", gap: 4, mt: 3 }}>
                  <ActionButton 
                    onClick={() => setCurrentStep(1)}
                    color="secondary"
                    disabled={isCreatingPin}
                  >
                    Back
                  </ActionButton>
                  <ActionButton 
                    onClick={handlePublish}
                    disabled={!selectedBoard || boardsLoading || isCreatingPin}
                  >
                    {isCreatingPin ? <CircularProgress size={20} /> : "Publish"}
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
                          icon={selectedBoard?.isProfile ? "octicon:person-24" : "mdi:image-off-outline"} 
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
          
          <CreateBoardModal
            open={showCreateBoardModal}
            onClose={handleCancelCreateBoard}
            onConfirm={handleConfirmCreateBoard}
            isLoading={isCreatingBoard}
          />
        </Box>
      </>
    );
  };
  
  export default CreateAest;