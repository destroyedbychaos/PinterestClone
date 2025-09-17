import { useState } from "react";
import { Button } from "../../components/nft-market/ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/nft-market/ui/card.jsx";
import { Input } from "../../components/nft-market/ui/input.jsx";

const CreateNFT = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    collection: "",
    supply: "1",
    blockchain: "ethereum",
    price: "",
    currency: "eth",
    listForSale: false
  });

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  ↑ Завантажити файл
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!previewUrl ? (
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="image/*,video/*,audio/*"
                        onChange={handleFileSelect}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-purple-600/10 rounded-full">
                            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-semibold mb-2 text-white">
                              Перетягніть файли сюди або натисніть для вибору
                            </p>
                            <p className="text-sm text-gray-400">
                              Підтримувані формати: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG
                            </p>
                            <p className="text-sm text-gray-400">
                              Максимальний розмір: 100MB
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="absolute top-2 right-2 bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700"
                        onClick={() => {
                          setPreviewUrl("");
                          setSelectedFile(null);
                        }}
                      >
                        Змінити
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Зображення
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Відео
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      Аудіо
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Документи
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            {previewUrl && (
              <Card className="bg-card/50 backdrop-blur-sm border-0 gradient-border">
                <CardHeader>
                  <CardTitle className="text-center">Попередній перегляд NFT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <img 
                      src={previewUrl} 
                      alt="NFT Preview"
                      className="w-full aspect-square object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-2">Ваш NFT</h3>
                    <p className="text-sm text-muted-foreground">
                      Так ваш NFT буде виглядати в маркетплейсі
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-6">
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Деталі NFT</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Назва *
                  </label>
                  <Input 
                    id="name" 
                    placeholder="Введіть назву вашого NFT"
                    className="bg-gray-700/50 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Опис
                  </label>
                  <textarea 
                    id="description" 
                    placeholder="Розкажіть про ваш NFT..."
                    className="flex min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white placeholder-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="collection" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Колекція
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.collection}
                    onChange={(e) => handleInputChange("collection", e.target.value)}
                  >
                    <option value="">Виберіть колекцію</option>
                    <option value="personal">Особиста колекція</option>
                    <option value="new">Створити нову колекцію</option>
                  </select>
                </div>

                <hr className="border-gray-600" />

                <div>
                  <label htmlFor="supply" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Кількість копій
                  </label>
                  <Input 
                    id="supply" 
                    type="number" 
                    defaultValue="1"
                    className="bg-gray-700/50 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400"
                    value={formData.supply}
                    onChange={(e) => handleInputChange("supply", e.target.value)}
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Кількість ідентичних копій цього NFT
                  </p>
                </div>

                <div>
                  <label htmlFor="blockchain" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Блокчейн
                  </label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.blockchain}
                    onChange={(e) => handleInputChange("blockchain", e.target.value)}
                  >
                    <option value="ethereum">Ethereum</option>
                    <option value="polygon">Polygon</option>
                    <option value="binance">Binance Smart Chain</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="bg-gray-800/80 backdrop-blur-sm border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Ціноутворення</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white">
                      Виставити на продаж відразу
                    </label>
                    <p className="text-sm text-gray-400">
                      NFT буде доступний для миттєвої покупки
                    </p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={formData.listForSale}
                    onChange={(e) => handleInputChange("listForSale", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-white">
                    Ціна
                  </label>
                  <div className="flex gap-2">
                    <Input 
                      id="price" 
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="bg-gray-700/50 border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-white placeholder-gray-400"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                    />
                    <select 
                      className="w-24 bg-gray-700/50 border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:border-purple-500"
                      value={formData.currency}
                      onChange={(e) => handleInputChange("currency", e.target.value)}
                    >
                      <option value="eth">ETH</option>
                      <option value="weth">WETH</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fees Info */}
            <Card className="bg-purple-600/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-purple-400 mb-2">Комісії платформи</h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <p>• Сервісний збір: 2.5%</p>
                      <p>• Роялті творця: 5.0%</p>
                      <p>• Комісія мережі: ~$10-50 (залежить від завантаженості)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Створити NFT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNFT; 