import { useEffect, useState } from "react";

const TransitionAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Створюємо частинки для ефекту
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 6 + 2,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          opacity: Math.random() * 0.8 + 0.2,
          color: `hsl(${Math.random() * 80 + 240}, 70%, 60%)`, // Більший діапазон кольорів
          delay: i * 20 // Різні затримки для появи
        });
      }
      setParticles(newParticles);
    };

    generateParticles();

    // Анімація по етапах
    const animationSequence = async () => {
      // Етап 1: Поява фону
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Етап 2: Анімація частинок
      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Етап 3: Поява логотипу
      setStage(3);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Етап 4: Анімація тексту
      setStage(4);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Етап 5: Фінальна анімація
      setStage(5);
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Завершення
      onComplete();
    };

    animationSequence();

    // Анімація частинок
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        opacity: particle.opacity + (Math.random() - 0.5) * 0.1
      })));
    };

    const particleInterval = setInterval(animateParticles, 50);

    return () => {
      clearInterval(particleInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Основний фон */}
      <div 
        className={`absolute inset-0 transition-all duration-1000 ease-out ${
          stage >= 1 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900/30 to-pink-900/30' 
            : 'bg-transparent'
        }`}
      />

      {/* Анімовані градієнтні кола */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full transition-all duration-2000 ease-out ${
            stage >= 1 
              ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 3s ease-in-out infinite' : 'none'
          }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full transition-all duration-2000 ease-out delay-300 ${
            stage >= 1 
              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 3s ease-in-out infinite 1.5s' : 'none'
          }}
        />
      </div>

      {/* Частинки */}
      {stage >= 2 && (
        <div className="absolute inset-0">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: 0,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                animation: 'float 4s ease-in-out infinite',
                transition: `opacity 1s ease-out ${particle.delay}ms`,
                animationDelay: `${particle.delay}ms`
              }}
              onTransitionEnd={() => {
                // Показуємо частинку після затримки
                setTimeout(() => {
                  const element = document.querySelector(`[data-particle-id="${particle.id}"]`);
                  if (element) {
                    element.style.opacity = particle.opacity;
                  }
                }, particle.delay);
              }}
              data-particle-id={particle.id}
            />
          ))}
        </div>
      )}

      {/* Логотип та текст */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`text-center transition-all duration-1500 ease-out ${
            stage >= 3 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}
        >
          {/* Логотип */}
          <div className="mb-8">
            <div 
              className={`w-32 h-32 mx-auto rounded-3xl transition-all duration-1500 ease-out ${
                stage >= 3 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 scale-100 shadow-2xl shadow-purple-500/50' 
                  : 'bg-transparent scale-0'
              }`}
              style={{
                backgroundSize: '200% 200%',
                animation: stage >= 3 ? 'gradient-shift 3s ease-in-out infinite, glow 2s ease-in-out infinite' : 'none'
              }}
            />
          </div>

          {/* Текст */}
          <h1 
            className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1500 ease-out ${
              stage >= 3 
                ? 'text-white opacity-100 translate-y-0' 
                : 'text-transparent opacity-0 translate-y-8'
            }`}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
              NeonNFT
            </span>
          </h1>

          <p 
            className={`text-2xl text-gray-300 transition-all duration-1500 ease-out delay-500 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            Відкрийте майбутнє цифрового мистецтва
          </p>

          {/* Додатковий текст */}
          <p 
            className={`text-lg text-gray-400 transition-all duration-1500 ease-out delay-800 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            Де кожен піксель стає шедевром
          </p>
        </div>
      </div>

      {/* Фінальна анімація */}
      {stage >= 5 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30"
            style={{
              animation: 'expand 1.2s ease-out forwards'
            }}
          />
        </div>
      )}


    </div>
  );
};

export default TransitionAnimation; 