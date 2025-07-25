import { Link } from "react-router-dom";
import { Button } from "../../components/nft-market/ui/button.jsx";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="mb-8">
          {/* 404 Number with gradient */}
          <h1 className="text-8xl md:text-9xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              404
            </span>
          </h1>
          
          {/* Title */}
          <h2 className="text-3xl font-bold mb-4 text-white">Сторінку не знайдено</h2>
          
          {/* Description */}
          <p className="text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
            Схоже, що ця сторінка не існує або була переміщена. 
            Поверніться на головну сторінку маркетплейсу або на основний сайт.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/nft-market">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Повернутися на головну NFT
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="text-white border-gray-600 hover:bg-gray-800/50 hover:border-purple-500 px-8 py-3 transition-all duration-300">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              На основний сайт
            </Button>
          </Link>
        </div>
        
        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-sm text-gray-400">
            💡 Якщо ви шукаєте конкретний NFT, спробуйте використати пошук на головній сторінці маркетплейсу.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 