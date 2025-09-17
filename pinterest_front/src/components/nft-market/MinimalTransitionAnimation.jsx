import { useEffect, useState } from "react";

const MinimalTransitionAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // Створюємо лінії для мінімалістичного ефекту
    const generateLines = () => {
      const newLines = [];
      for (let i = 0; i < 8; i++) {
        newLines.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          length: Math.random() * 100 + 50,
          angle: Math.random() * 360,
          opacity: 0,
          delay: i * 100
        });
      }
      setLines(newLines);
    };

    generateLines();

    // Мінімалістична анімація по етапах
    const animationSequence = async () => {
      // Етап 1: Поява ліній
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Етап 2: Анімація логотипу
      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Етап 3: Фінальна анімація
      setStage(3);
      await new Promise(resolve => setTimeout(resolve, 150));

      // Завершення
      onComplete();
    };

    animationSequence();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-gray-900">
      {/* Мінімалістичні лінії - "малюють" кільця */}
      <div className="absolute inset-0">
        {lines.map(line => (
          <div
            key={line.id}
            className="absolute h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"
            style={{
              left: `${line.x}px`,
              top: `${line.y}px`,
              width: `${line.length}px`,
              transform: `rotate(${line.angle}deg)`,
              opacity: stage >= 1 ? 0.4 : 0,
              transition: `opacity 0.6s ease-out ${line.delay}ms`,
              boxShadow: stage >= 2 ? '0 0 8px rgba(147, 51, 234, 0.2)' : 'none',
              animation: stage >= 2 ? 'minimal-pulse 3s ease-in-out infinite' : 'none'
            }}
          />
        ))}
      </div>

      {/* Додаткові точки для ефекту */}
      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${50 + 30 * Math.cos(i * 30 * Math.PI / 180)}%`,
              top: `${50 + 30 * Math.sin(i * 30 * Math.PI / 180)}%`,
              opacity: stage >= 1 ? 0.3 : 0,
              transition: `opacity 0.8s ease-out ${i * 100}ms`,
              animation: stage >= 2 ? 'minimal-float 4s ease-in-out infinite' : 'none',
              animationDelay: `${i * 200}ms`
            }}
          />
        ))}
      </div>

      {/* Центральний елемент */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`relative transition-all duration-500 ease-out ${
            stage >= 2 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          {/* Зовнішнє кільце - розкривається */}
          <div 
            className={`w-40 h-40 rounded-full border border-purple-500 transition-all duration-400 ease-out ${
              stage >= 2 
                ? 'scale-100 opacity-40' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              animation: stage >= 2 ? 'minimal-rotate 4s linear infinite' : 'none'
            }}
          />
          
          {/* Середнє кільце */}
          <div 
            className={`absolute top-1/2 left-1/2 w-24 h-24 rounded-full border-2 border-purple-400 transition-all duration-400 ease-out delay-100 ${
              stage >= 2 
                ? 'scale-100 opacity-70' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'minimal-rotate-reverse 3s linear infinite' : 'none'
            }}
          />

          {/* Внутрішнє кільце */}
          <div 
            className={`absolute top-1/2 left-1/2 w-12 h-12 rounded-full border border-purple-300 transition-all duration-400 ease-out delay-200 ${
              stage >= 2 
                ? 'scale-100 opacity-90' 
                : 'scale-0 opacity-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'minimal-rotate 2s linear infinite' : 'none'
            }}
          />

          {/* Центральна точка */}
          <div 
            className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full transition-all duration-400 ease-out delay-300 ${
              stage >= 2 
                ? 'bg-purple-500 scale-100 shadow-lg shadow-purple-500/50' 
                : 'bg-transparent scale-0'
            }`}
            style={{
              transform: 'translate(-50%, -50%)',
              animation: stage >= 2 ? 'minimal-glow 1.5s ease-in-out infinite' : 'none'
            }}
          />
        </div>
      </div>

      {/* Текст */}
      <div 
        className={`absolute bottom-1/4 left-1/2 transform -translate-x-1/2 text-center transition-all duration-400 ease-out delay-150 ${
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
              animation: 'minimal-expand-fast 0.25s ease-out forwards'
            }}
          />
        </div>
      )}


    </div>
  );
};

export default MinimalTransitionAnimation; 