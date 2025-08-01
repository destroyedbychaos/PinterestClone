import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Input } from "../../components/nft-market/ui/input.jsx";
import { useWeb3 } from "../../contexts/Web3Context.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useUser } from "../../hooks/useUser.js";
import { getFullImageUrl, handleImageError } from "../../utils/imageUtils.js";
import { toast } from "react-toastify";

const EditProfile = () => {
  const navigate = useNavigate();
  const { account, isConnected } = useWeb3();
  const { isAuthenticated, user, updateUserProfile } = useAuth();
  const { updateProfile, uploadAvatar, uploadBanner, isLoading } = useUser();
  
  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: ""
  });
  
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Завантаження даних користувача
  useEffect(() => {
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        bannerUrl: user.bannerUrl || ""
      });
      // Очищення попередніх переглядів при завантаженні нових даних
      setPreviewAvatar(null);
      setPreviewBanner(null);
      setAvatarFile(null);
      setBannerFile(null);
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Перевірка типу файлу
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Підтримуються тільки зображення (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Перевірка розміру файлу (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Розмір файлу не повинен перевищувати 5MB');
        return;
      }

      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewAvatar(url);
      // Очищення попереднього перегляду банера при завантаженні аватара
      setPreviewBanner(null);
      setBannerFile(null);
    }
  };

  const handleBannerChange = (event) => {
    console.log('handleBannerChange called', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      
      // Перевірка типу файлу
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Підтримуються тільки зображення (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Перевірка розміру файлу (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Розмір файлу не повинен перевищувати 10MB');
        return;
      }

      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setPreviewBanner(url);
      console.log('Banner preview set:', url);
      
      // Очищення попереднього перегляду аватара при завантаженні банера
      setPreviewAvatar(null);
      setAvatarFile(null);
    }
  };

  const handleSave = async () => {
    if (!account || !isAuthenticated) {
      toast.error('Потрібна авторизація');
      return;
    }

    try {
      setIsSaving(true);
      let updatedData = { ...formData };

      // Завантаження аватара
      if (avatarFile) {
        const avatarUrl = await uploadAvatar(account, avatarFile);
        updatedData.avatarUrl = avatarUrl;
        setFormData(prev => ({ ...prev, avatarUrl }));
        toast.success('Аватар завантажено успішно');
      }

      // Завантаження банера
      if (bannerFile) {
        console.log('Uploading banner file:', bannerFile.name);
        const bannerUrl = await uploadBanner(account, bannerFile);
        console.log('Banner uploaded successfully:', bannerUrl);
        updatedData.bannerUrl = bannerUrl;
        setFormData(prev => ({ ...prev, bannerUrl }));
        toast.success('Банер завантажено успішно');
      }

      // Оновлення профілю (тільки nickname та bio, аватар та банер оновлюються окремо)
      const updatedUser = await updateProfile(account, {
        nickname: updatedData.nickname,
        bio: updatedData.bio
      });

      // Оновлення локального стану
      updateUserProfile({
        ...updatedUser,
        avatarUrl: updatedData.avatarUrl || user?.avatarUrl,
        bannerUrl: updatedData.bannerUrl || user?.bannerUrl
      });

      // Очищення попередніх переглядів після успішного збереження
      setPreviewAvatar(null);
      setPreviewBanner(null);
      setAvatarFile(null);
      setBannerFile(null);
      
      toast.success('Профіль оновлено успішно!');
      navigate('/nft-market/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Помилка оновлення профілю');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Скидання попередніх переглядів
    setPreviewAvatar(null);
    setPreviewBanner(null);
    setAvatarFile(null);
    setBannerFile(null);
    
    // Повернення до початкових даних
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        bannerUrl: user.bannerUrl || ""
      });
    }
    
    navigate('/nft-market/profile');
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
              <p className="text-gray-400">Для редагування профілю потрібно підключити гаманець та авторизуватись.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Редагувати профіль</h1>
              <p className="text-gray-400">Оновіть інформацію про ваш профіль</p>
            </div>
            <Link to="/nft-market/profile">
              <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Назад
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Banner */}
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Банер профілю</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
                    {(previewBanner || formData.bannerUrl) ? (
                      <img 
                        src={previewBanner || getFullImageUrl(formData.bannerUrl)} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    ) : null}
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                      id="banner-upload"
                      ref={(input) => {
                        if (input) {
                          input.onclick = () => {
                            input.value = '';
                          };
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Banner button clicked');
                        document.getElementById('banner-upload').click();
                      }}
                      className="bg-gray-900/80 hover:bg-gray-800 text-white cursor-pointer px-4 py-2 rounded flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Змінити банер
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  Рекомендований розмір: 1200x300px. Максимальний розмір файлу: 10MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Avatar and Basic Info */}
          <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Основна інформація</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Аватар
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                                         <img 
                       src={previewAvatar || getFullImageUrl(formData.avatarUrl) || `https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                       alt="Avatar"
                       className="w-20 h-20 rounded-full object-cover"
                       onError={handleImageError}
                     />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Оновити аватар</p>
                    <p className="text-sm text-gray-400">Рекомендований розмір: 400x400px. Максимальний розмір файлу: 5MB</p>
                  </div>
                </div>
              </div>

              {/* Nickname */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Нікнейм
                </label>
                <Input
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  placeholder="Введіть ваш нікнейм"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Ваш публічний нікнейм, який буде відображатись на маркетплейсі
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Біографія
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Розкажіть про себе..."
                  rows={4}
                  maxLength={500}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-sm text-gray-400 mt-1">
                  {formData.bio.length}/500 символів
                </p>
              </div>

              {/* Wallet Address (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Адреса гаманця
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={account || ''}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(account);
                      toast.success('Адресу скопійовано');
                    }}
                    className="border-gray-600 text-white hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Скасувати
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isSaving || isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Збереження...
                </div>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Зберегти зміни
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;