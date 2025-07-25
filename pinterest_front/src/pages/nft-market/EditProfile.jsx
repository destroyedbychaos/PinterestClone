import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Input } from "../../components/nft-market/ui/input.jsx";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    nickname: "Ukrainian Artist",
    bio: "Цифровий художник, що досліджує межі між технологією та мистецтвом. Створюю унікальні NFT, що поєднують традиційні техніки з сучасними інноваціями.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1634193295627-1cdddf751ebf?w=800&h=300&fit=crop"
  });

  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [previewCover, setPreviewCover] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (field === 'avatar') {
        setPreviewAvatar(url);
      } else if (field === 'coverImage') {
        setPreviewCover(url);
      }
    }
  };

  const handleSave = () => {
    // Тут буде логіка збереження змін
    console.log('Збереження профілю:', formData);
    // Можна додати повідомлення про успішне збереження
  };

  const handleCancel = () => {
    // Скидання попередніх переглядів
    setPreviewAvatar(null);
    setPreviewCover(null);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">Редагування профілю</h1>
            <Link to="/nft-market/profile">
              <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Скасувати
              </Button>
            </Link>
          </div>
          <p className="text-gray-400">Оновіть інформацію про себе та налаштуйте зовнішній вигляд профілю</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Cover & Avatar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Шапка профілю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative h-48 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg overflow-hidden">
                    <img 
                      src={previewCover || formData.coverImage} 
                      alt="Cover" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20"></div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="cover-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange('coverImage', e)}
                    />
                    <label htmlFor="cover-upload">
                      <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Змінити шапку
                      </Button>
                    </label>
                    <p className="text-sm text-gray-400">Рекомендований розмір: 1200x400 пікселів</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Аватарка профілю
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-gray-900 rounded-full overflow-hidden">
                      <img 
                        src={previewAvatar || formData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange('avatar', e)}
                    />
                    <label htmlFor="avatar-upload">
                      <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-700">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Змінити аватарку
                      </Button>
                    </label>
                    <p className="text-sm text-gray-400 mt-2">Рекомендований розмір: 400x400 пікселів</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Основна інформація</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="nickname" className="text-sm font-medium text-white mb-2 block">
                    Нікнейм *
                  </label>
                  <Input 
                    id="nickname" 
                    placeholder="Введіть ваш нікнейм"
                    className="bg-gray-700/50 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange("nickname", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="text-sm font-medium text-white mb-2 block">
                    Про себе
                  </label>
                  <textarea 
                    id="bio" 
                    placeholder="Розкажіть про себе..."
                    rows={10}
                    className="w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Максимум 500 символів
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Зберегти зміни
              </Button>
              
              <Button 
                onClick={handleCancel}
                variant="outline" 
                className="w-full text-white border-gray-600 hover:bg-gray-700"
              >
                Скасувати
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile; 