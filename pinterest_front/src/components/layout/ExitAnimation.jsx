import { useEffect, useState } from "react";

const ExitAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Проста анімація виходу
    const animationSequence = async () => {
      // Етап 1: Початок анімації
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Етап 2: Фінальна анімація
      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Завершення
      onComplete();
    };

    animationSequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900">
      {/* Плавний перехід */}
      <div 
        className={`absolute inset-0 transition-all duration-500 ease-out ${
          stage >= 1 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20' 
            : 'bg-transparent'
        }`}
      />

      {/* Центральний елемент */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`transition-all duration-500 ease-out ${
            stage >= 1 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-90'
          }`}
        >
          <div 
            className={`w-16 h-16 rounded-full border-2 transition-all duration-500 ease-out ${
              stage >= 1 
                ? 'border-purple-500 scale-100' 
                : 'border-transparent scale-0'
            }`}
            style={{
              animation: stage >= 1 ? 'exit-rotate 2s linear infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Фінальна анімація */}
      {stage >= 2 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"
            style={{
              animation: 'exit-fade 0.3s ease-out forwards'
            }}
          />
        </div>
      )}


    </div>
  );
};

export default ExitAnimation; 