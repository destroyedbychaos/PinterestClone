import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Input } from "../../components/nft-market/ui/input.jsx";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import { useNFTAuth } from "@/hooks/useNFTAuth";
import { useNFT } from "../../hooks/useNFT.js";
import CelebrationEffect from "../../components/nft-market/CelebrationEffect.jsx";
import { toast } from "react-toastify";
import { getFullImageUrl, handleImageError } from "../../utils/imageUtils.js";

const CreateNFT = () => {
  const navigate = useNavigate();
  const { account, isConnected } = useWeb3();
  const { isAuthenticated } = useNFTAuth();
  const { createNFT, mintNFT, isLoading } = useNFT();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    currency: "MATIC",
    royaltyFraction: "0",
    isForSale: false
  });
  
  const [step, setStep] = useState(1); 
  const [createdNFT, setCreatedNFT] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Підтримуються тільки зображення (JPEG, PNG, GIF, WebP)');
        return;
      }


      if (file.size > 10 * 1024 * 1024) {
        toast.error('Розмір файлу не повинен перевищувати 10MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!selectedFile) {
      toast.error('Виберіть зображення для NFT');
      return false;
    }
    if (!formData.name.trim()) {
      toast.error('Введіть назву NFT');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Введіть опис NFT');
      return false;
    }
    if (formData.isForSale && (!formData.price || parseFloat(formData.price) <= 0)) {
      toast.error('Введіть коректну ціну');
      return false;
    }
    const royalty = parseFloat(formData.royaltyFraction);
    if (royalty < 0 || royalty > 10) {
      toast.error('Роялті повинно бути від 0% до 10%');
      return false;
    }
    return true;
  };

  const handleCreateNFT = async () => {
    if (!isConnected || !isAuthenticated) {
      toast.error('Спочатку підключіть гаманець та авторизуйтесь');
      return;
    }

    if (!validateForm()) return;

    try {
      const nftData = {
        ...formData,
        royaltyFraction: parseFloat(formData.royaltyFraction) * 100 
      };

      const createdNft = await createNFT(nftData, selectedFile);
      console.log('NFT created successfully:', createdNft);
      setCreatedNFT(createdNft);
      setStep(2);
      toast.success('NFT створено успішно! Тепер можете перейти до мінтингу.');
    } catch (error) {
      console.error('Error creating NFT:', error);
      toast.error('Помилка створення NFT');
    }
  };

  const handleMintNFT = async () => {
    if (!createdNFT) {
      console.error('No createdNFT available for minting');
      toast.error('Помилка: NFT не знайдено для мінтингу');
      return;
    }

    console.log(' Starting NFT minting process...');
    console.log('CreatedNFT object:', createdNFT);

    try {
 
      const tokenURI = createdNFT.imageUrl;
      
      if (!tokenURI) {
        console.error(' No tokenURI available. CreatedNFT structure:', Object.keys(createdNFT));
        throw new Error('Не вдалося отримати URL для мінтингу NFT. Перевірте що зображення було завантажено.');
      }
      
      console.log(' Using tokenURI:', tokenURI);
      console.log(' Royalty fraction:', parseInt(formData.royaltyFraction) * 100);
      
      const result = await mintNFT(
        createdNFT.id,
        tokenURI,
        parseInt(formData.royaltyFraction) * 100
      );
      
      console.log(' Mint result:', result);
      console.log(' Transitioning to step 3...');
      

      setShowCelebration(true);
      
      console.log(' Step 3 reached! Celebration started!');
      toast.success(' NFT успішно заміновано на блокчейні!');
      

      setTimeout(() => {
        toast.info(' NFT додано у ваш профіль!', {
          autoClose: 3000,
          position: "bottom-right"
        });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error minting NFT:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        createdNFT: createdNFT,
        formData: formData
      });
      

      let errorMessage = 'Помилка мінтингу NFT: ';
      let toastType = 'error';
      let autoClose = 5000;
      
      if (error.message.includes('база даних')) {
        errorMessage = error.message;
        toastType = 'warning';
        autoClose = 12000; 
      } else if (error.message.includes('User rejected') || error.message.includes('відхилена')) {
        errorMessage = 'Транзакцію було відхилено користувачем';
        toastType = 'info';
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = 'Недостатньо коштів для оплати газу';
      } else if (error.message.includes('network')) {
        errorMessage = 'Проблема з мережею. Перевірте підключення до Polygon';
      } else {
        errorMessage += error.message;
      }
      
      if (toastType === 'warning') {
        toast.warning(errorMessage, { autoClose });
      } else if (toastType === 'info') {
        toast.info(errorMessage, { autoClose });
      } else {
        toast.error(errorMessage, { autoClose });
      }
      

    }
  };

  const handleReset = () => {
    setStep(1);
    setCreatedNFT(null);
    setSelectedFile(null);
    setPreviewUrl("");
    setShowCelebration(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      currency: "MATIC",
      royaltyFraction: "0",
      isForSale: false
    });
  };

  if (!isConnected || !isAuthenticated) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Потрібна авторизація</h3>
              <p className="text-gray-400">Для створення NFT потрібно підключити гаманець та авторизуватись.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">
            Створити <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">NFT</span>
          </h1>
          <p className="text-xl text-gray-300">
            Перетворіть свою творчість на унікальний цифровий актив
          </p>
        </div>


        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-purple-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 1 ? 'border-purple-400 bg-purple-400 text-white' : 'border-gray-600'
              }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className="ml-2 font-medium">Створити</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-purple-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 2 ? 'border-purple-400 bg-purple-400 text-white' : 'border-gray-600'
              }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className="ml-2 font-medium">Мінтити</span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-purple-400' : 'bg-gray-600'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-purple-400' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                step >= 3 ? 'border-purple-400 bg-purple-400 text-white' : 'border-gray-600'
              }`}>
                {step >= 3 ? '✓' : '3'}
              </div>
              <span className="ml-2 font-medium">Готово</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Зображення NFT</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                      <div className="text-center space-y-4">
                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-medium text-white mb-2">Завантажте зображення</h3>
                        <p className="text-gray-400 mb-4">PNG, JPG, GIF до 10MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label 
                          htmlFor="file-upload" 
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Обрати файл
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl("");
                        }}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>


            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Деталі NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Назва *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Введіть назву вашого NFT"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Опис *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Розкажіть про ваш NFT..."
                    rows={4}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Роялті (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.royaltyFraction}
                    onChange={(e) => handleInputChange('royaltyFraction', e.target.value)}
                    placeholder="0"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Відсоток, який ви отримуватимете з кожного перепродажу
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="for-sale"
                      checked={formData.isForSale}
                      onChange={(e) => handleInputChange('isForSale', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="for-sale" className="ml-2 text-sm font-medium text-gray-300">
                      Виставити на продаж
                    </label>
                  </div>

                  {formData.isForSale && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Ціна
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            placeholder="0.001"
                            className="bg-gray-700 border-gray-600 text-white flex-1"
                          />
                          <select
                            value={formData.currency}
                            onChange={(e) => handleInputChange('currency', e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-md text-white px-3 py-2"
                          >
                            <option value="MATIC">MATIC</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateNFT}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Створення...
                    </div>
                  ) : (
                    'Створити NFT'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && createdNFT && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-center">Мінтинг NFT</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div>
                  <img
                    src={createdNFT.imageUrl ? getFullImageUrl(createdNFT.imageUrl) : previewUrl}
                    alt={createdNFT.name}
                    className="w-48 h-48 object-cover rounded-lg mx-auto"
                    onError={(e) => handleImageError(e, 'NFT')}
                  />
                  <h3 className="text-xl font-bold text-white mt-4">{createdNFT.name}</h3>
                  <p className="text-gray-400">{createdNFT.description}</p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300 mb-2">
                    Ваш NFT створено в базі даних. Щоб зробити його справжнім NFT на блокчейні, 
                    потрібно його замінтити.
                  </p>
                  <p className="text-sm text-gray-400">
                    Мінтинг створить токен на блокчейні Polygon і зв'яже його з вашим зображенням.
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleMintNFT}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Мінтинг...
                      </div>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Мінтити NFT
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/nft-market/nft/${createdNFT.id}`)}
                    className="border-gray-600 text-white hover:bg-gray-700 px-8 py-3"
                  >
                    Переглянути NFT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 3 && createdNFT && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 transform transition-all duration-500">
              <CardContent className="text-center space-y-6 p-8">


                <div className="space-y-4">
                  <h2 className="text-4xl font-bold animate-rainbow-text animate-pulse">
                    NFT успішно створено!
                  </h2>
                  <p className="text-gray-300 text-lg">
                    Ваш NFT заміновано на блокчейні Polygon і тепер доступний для торгівлі.
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-400 px-6 py-3 rounded-full border border-green-500/30 animate-celebration-glow">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Додано в ваш профіль</span>
                  </div>
                </div>

                <div className="relative">
                  <img
                    src={createdNFT.imageUrl ? getFullImageUrl(createdNFT.imageUrl) : previewUrl}
                    alt={createdNFT.name}
                    className="w-64 h-64 object-cover rounded-2xl mx-auto shadow-2xl shadow-purple-500/30 transform transition-transform duration-500"
                    onError={(e) => handleImageError(e, 'NFT')}
                  />

                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-800/40 to-pink-800/40 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-2xl font-bold text-white mb-3">{createdNFT.name}</h3>
                  <p className="text-gray-300 text-base">{createdNFT.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => navigate(`/nft-market/nft/${createdNFT.id}`)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Переглянути NFT
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/nft-market/profile')}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3 transition-all duration-300 shadow-lg shadow-blue-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Мій профіль
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-gray-600 text-white px-8 py-3 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Створити ще один
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        

        <CelebrationEffect 
          isActive={showCelebration} 
          onComplete={() => setShowCelebration(false)} 
        />
      </div>
    </div>
  );
};

export default CreateNFT;