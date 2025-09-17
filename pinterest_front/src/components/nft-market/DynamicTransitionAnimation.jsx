import { useEffect, useState } from "react";

const DynamicTransitionAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [dots, setDots] = useState([]);

  useEffect(() => {
    // Створюємо динамічні точки
    const generateDots = () => {
      const newDots = [];
      for (let i = 0; i < 16; i++) {
        newDots.push({
          id: i,
          x: 50 + 35 * Math.cos(i * 22.5 * Math.PI / 180),
          y: 50 + 35 * Math.sin(i * 22.5 * Math.PI / 180),
          size: Math.random() * 3 + 2,
          delay: i * 50,
          direction: Math.random() > 0.5 ? 1 : -1
        });
      }
      setDots(newDots);
    };

    generateDots();

    // Динамічна анімація по етапах
    const animationSequence = async () => {
      // Етап 1: Поява точок
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Етап 2: Анімація центрального елемента
      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Етап 3: Фінальна анімація
      setStage(3);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Завершення
      onComplete();
    };

    animationSequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900">
      {/* Динамічні точки по колу */}
      <div className="absolute inset-0">
        {dots.map(dot => (
          <div
            key={dot.id}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              opacity: stage >= 1 ? 0.6 : 0,
              transition: `opacity 0.5s ease-out ${dot.delay}ms`,
              animation: stage >= 1 ? `dynamic-rotate-${dot.direction} 4s linear infinite` : 'none',
              animationDelay: `${dot.delay}ms`,
              boxShadow: stage >= 1 ? '0 0 6px rgba(147, 51, 234, 0.4)' : 'none'
            }}
          />
        ))}
      </div>

      {/* Центральний динамічний елемент */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`relative transition-all duration-600 ease-out ${
            stage >= 2 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90'
          }`}
        >
          {/* Зовнішнє кільце з обертанням */}
          <div 
            className={`w-36 h-36 rounded-full border border-purple-500 transition-all duration-600 ease-out ${
              stage >= 2 
                ? 'scale-100 opacity-30' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              animation: stage >= 2 ? 'dynamic-spin 5s linear infinite' : 'none',
              boxShadow: stage >= 2 ? '0 0 20px rgba(147, 51, 234, 0.2)' : 'none'
            }}
          />
          
          {/* Середнє кільце з протилежним обертанням */}
          <div 
            className={`absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-purple-400 transition-all duration-600 ease-out delay-200 ${
              stage >= 2 
                ? 'scale-100 opacity-60' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'dynamic-spin-reverse 4s linear infinite' : 'none',
              boxShadow: stage >= 2 ? '0 0 15px rgba(147, 51, 234, 0.3)' : 'none'
            }}
          />

          {/* Внутрішнє кільце з пульсацією */}
          <div 
            className={`absolute top-1/2 left-1/2 w-8 h-8 rounded-full border border-purple-300 transition-all duration-500 ease-out delay-300 ${
              stage >= 2 
                ? 'scale-100 opacity-90' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'dynamic-pulse 1.5s ease-in-out infinite' : 'none'
            }}
          />

          {/* Центральна точка з ефектом світіння */}
          <div 
            className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full transition-all duration-500 ease-out delay-450 ${
              stage >= 2 
                ? 'bg-purple-500 scale-100 shadow-lg shadow-purple-500/50' 
                : 'bg-transparent scale-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'dynamic-glow 2s ease-in-out infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Динамічний текст */}
      <div 
        className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 text-center transition-all duration-500 ease-out delay-200 ${
          stage >= 2 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-6'
        }`}
      >
        <p className="text-xl text-gray-300 font-medium tracking-wider">
          Welcome back
        </p>
        <p className="text-sm text-gray-500 font-light mt-1">
          Ready to explore?
        </p>
      </div>

      {/* Фінальна анімація */}
      {stage >= 3 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/8 to-pink-600/8"
            style={{
              animation: 'dynamic-expand 0.25s ease-out forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DynamicTransitionAnimation; 