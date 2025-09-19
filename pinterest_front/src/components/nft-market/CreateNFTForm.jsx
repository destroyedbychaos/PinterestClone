import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Slider,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import { CloudUpload, Create, Publish } from '@mui/icons-material';
import { useNFT } from '../../hooks/useNFT';
import { useNFTAuth } from '@/hooks/useNFTAuth';
import { useWeb3 } from '../../contexts/Web3Context';
import { toast } from 'react-toastify';

const CreateNFTForm = ({ onSuccess, onCancel }) => {
  const { createNFT, mintNFT, isLoading } = useNFT();
  const { isAuthenticated } = useNFTAuth();
  const { isConnected, account } = useWeb3();

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'MATIC',
    isForSale: false,
    royaltyFraction: 250 
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [createdNFT, setCreatedNFT] = useState(null);
  const [errors, setErrors] = useState({});

  const steps = [
    'Основна інформація',
    'Завантаження зображення',
    'Налаштування продажу',
    'Мінтинг NFT'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {

      if (!file.type.startsWith('image/')) {
        toast.error('Будь ласка, оберіть файл зображення');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Розмір файлу не може перевищувати 10MB');
        return;
      }

      setImageFile(file);
      
 
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.name.trim()) newErrors.name = 'Назва обовʼязкова';
        if (!formData.description.trim()) newErrors.description = 'Опис обовʼязковий';
        break;
      case 1:
        if (!imageFile) newErrors.image = 'Зображення обовʼязкове';
        break;
      case 2:
        if (formData.isForSale && (!formData.price || parseFloat(formData.price) <= 0)) {
          newErrors.price = 'Вкажіть правильну ціну';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreateNFT = async () => {
    if (!isAuthenticated || !isConnected) {
      toast.error('Підключіть гаманець та увійдіть в систему');
      return;
    }

    if (!validateStep(2)) return;

    try {
      const nftData = {
        name: formData.name,
        description: formData.description,
        price: formData.isForSale ? parseFloat(formData.price) : 0,
        currency: formData.currency,
        isForSale: formData.isForSale,
        royaltyFraction: formData.royaltyFraction
      };

      const result = await createNFT(nftData, imageFile);
      setCreatedNFT(result);
      setActiveStep(3);
      toast.success('NFT створено успішно! Він зʼявився у вашому профілі у вкладці "Створені".');
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error(error.message || 'Помилка створення NFT');
    }
  };

  const handleMintNFT = async () => {
    if (!createdNFT) return;

    try {
      const tokenURI = createdNFT.ipfsMetadataUrl || `ipfs://${createdNFT.ipfsMetadata}`;
      const result = await mintNFT(createdNFT.id, tokenURI, formData.royaltyFraction);
      
      toast.success(`NFT заміньчено! Token ID: ${result.tokenId}`);
      
      if (onSuccess) {
        onSuccess({
          ...createdNFT,
          tokenId: result.tokenId,
          transactionHash: result.transactionHash
        });
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error(error.message || 'Помилка мінтингу NFT');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Назва NFT"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Опис"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Роялті для автора: {(formData.royaltyFraction / 100).toFixed(1)}%
              </Typography>
              <Slider
                value={formData.royaltyFraction}
                onChange={(e, value) => setFormData(prev => ({ ...prev, royaltyFraction: value }))}
                min={0}
                max={1000}
                step={25}
                marks={[
                  { value: 0, label: '0%' },
                  { value: 250, label: '2.5%' },
                  { value: 500, label: '5%' },
                  { value: 1000, label: '10%' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${(value / 100).toFixed(1)}%`}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2, py: 2 }}
              >
                Завантажити зображення
              </Button>
            </label>
            
            {errors.image && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.image}
              </Alert>
            )}

            {imagePreview && (
              <Box textAlign="center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 300,
                    borderRadius: 8,
                    border: '1px solid #ddd'
                  }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {imageFile?.name}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isForSale}
                    onChange={handleInputChange}
                    name="isForSale"
                  />
                }
                label="Виставити на продаж одразу"
              />
            </Grid>
            
            {formData.isForSale && (
              <>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Ціна"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    error={!!errors.price}
                    helperText={errors.price}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">MATIC</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Валюта"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    disabled
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Alert severity="info">
                Після створення NFT, ви зможете заміньчити його на блокчейні Polygon.
                Це потребуватиме підпису транзакції та сплати газу.
              </Alert>
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box textAlign="center">
            {createdNFT ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  NFT готовий до мінтингу!
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ID: {createdNFT.id}
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={handleMintNFT}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Publish />}
                  sx={{ mt: 2 }}
                >
                  {isLoading ? 'Мінтинг...' : 'Заміньчити NFT'}
                </Button>
              </Box>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  onClick={handleCreateNFT}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <Create />}
                >
                  {isLoading ? 'Створення...' : 'Створити NFT'}
                </Button>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  if (!isAuthenticated || !isConnected) {
    return (
      <Alert severity="warning">
        Для створення NFT необхідно підключити гаманець та увійти в систему.
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Створити NFT
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {renderStepContent(index)}
                
                <Box sx={{ mb: 2, mt: 2 }}>
                  <Button
                    disabled={activeStep === 0 || isLoading}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Назад
                  </Button>
                  
                  {activeStep < steps.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      disabled={isLoading}
                    >
                      Далі
                    </Button>
                  ) : null}
                  
                  {onCancel && (
                    <Button
                      onClick={onCancel}
                      disabled={isLoading}
                      sx={{ ml: 1 }}
                    >
                      Скасувати
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default CreateNFTForm;