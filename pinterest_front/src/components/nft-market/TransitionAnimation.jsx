import { useEffect, useState } from "react";

const TransitionAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);
  const [logoScale, setLogoScale] = useState(0);
  const [logoRotation, setLogoRotation] = useState(0);
  const [energyRings, setEnergyRings] = useState([]);

  useEffect(() => {

    const generateEnergyRings = () => {
      const rings = [];
      for (let i = 0; i < 5; i++) {
        rings.push({
          id: i,
          size: 160 + i * 40,
          opacity: 0.3 - i * 0.05,
          delay: i * 200,
          speed: 2 + i * 0.5
        });
      }
      setEnergyRings(rings);
    };


    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 120; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 8 + 3,
          speedX: (Math.random() - 0.5) * 4,
          speedY: (Math.random() - 0.5) * 4,
          opacity: Math.random() * 0.9 + 0.1,
          color: `hsl(${Math.random() * 60 + 250}, 80%, 70%)`,
          delay: i * 15,
          pulse: Math.random() * 2 + 1
        });
      }
      setParticles(newParticles);
    };

    generateEnergyRings();
    generateParticles();

    const animationSequence = async () => {

      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 800));


      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 2000));

      setStage(3);
      setLogoScale(1);
      setLogoRotation(360);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setStage(4);
      await new Promise(resolve => setTimeout(resolve, 1200));

      setStage(5);
      await new Promise(resolve => setTimeout(resolve, 1000));


      onComplete();
    };

    animationSequence();

    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        opacity: particle.opacity + Math.sin(Date.now() * 0.001 * particle.pulse) * 0.1,
        size: particle.size + Math.sin(Date.now() * 0.002 * particle.pulse) * 2
      })));
    };

    const particleInterval = setInterval(animateParticles, 30);

    const animateRings = () => {
      setEnergyRings(prev => prev.map(ring => ({
        ...ring,
        opacity: 0.3 - ring.id * 0.05 + Math.sin(Date.now() * 0.001 * ring.speed) * 0.1
      })));
    };

    const ringInterval = setInterval(animateRings, 50);

    return () => {
      clearInterval(particleInterval);
      clearInterval(ringInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`absolute inset-0 transition-all duration-800 ease-out ${
          stage >= 1 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900/40 to-pink-900/40' 
            : 'bg-transparent'
        }`}
      />

 
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full transition-all duration-1500 ease-out ${
            stage >= 1 
              ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 2s ease-in-out infinite, rotate 20s linear infinite' : 'none'
          }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full transition-all duration-1500 ease-out delay-200 ${
            stage >= 1 
              ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 blur-3xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 2s ease-in-out infinite 1s, rotate 15s linear infinite reverse' : 'none'
          }}
        />
        <div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full transition-all duration-1500 ease-out delay-400 ${
            stage >= 1 
              ? 'bg-gradient-to-r from-pink-600/20 to-blue-600/20 blur-2xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 3s ease-in-out infinite 0.5s, rotate 25s linear infinite' : 'none'
          }}
        />
      </div>


      {stage >= 2 && (
        <div className="absolute inset-0">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                opacity: 0,
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                animation: 'float 3s ease-in-out infinite',
                transition: `opacity 0.8s ease-out ${particle.delay}ms`,
                animationDelay: `${particle.delay}ms`
              }}
              onTransitionEnd={() => {
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

      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={`text-center transition-all duration-1200 ease-out ${
            stage >= 3 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-75'
          }`}
        >

          {stage >= 3 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {energyRings.map(ring => (
                <div
                  key={ring.id}
                  className="absolute border-2 border-purple-500 rounded-full"
                  style={{
                    width: `${ring.size}px`,
                    height: `${ring.size}px`,
                    top: `-${ring.size / 2}px`,
                    left: `-${ring.size / 2}px`,
                    opacity: ring.opacity,
                    animation: `rotate ${3 + ring.id}s linear infinite, pulse ${2 + ring.id * 0.5}s ease-in-out infinite`,
                    animationDelay: `${ring.delay}ms`
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative mb-8">
            <div 
              className={`w-40 h-40 mx-auto rounded-3xl transition-all duration-1500 ease-out ${
                stage >= 3 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 scale-100 shadow-2xl shadow-purple-500/70' 
                  : 'bg-transparent scale-0'
              }`}
              style={{
                backgroundSize: '200% 200%',
                animation: stage >= 3 ? 'gradient-shift 2s ease-in-out infinite, glow 1.5s ease-in-out infinite' : 'none',
                transform: `scale(${logoScale}) rotate(${logoRotation}deg)`
              }}
            >

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-4xl font-bold">NFT</div>
              </div>
            </div>
            

            {stage >= 3 && (
              <>
                <div 
                  className="absolute inset-0 w-40 h-40 rounded-3xl border-2 border-purple-400"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite, rotate 10s linear infinite'
                  }}
                />
                <div 
                  className="absolute inset-0 w-40 h-40 rounded-3xl border border-pink-400"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite 0.5s, rotate 8s linear infinite reverse'
                  }}
                />
              </>
            )}
          </div>


          <h1 
            className={`text-6xl md:text-8xl font-bold mb-6 transition-all duration-1200 ease-out ${
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
            className={`text-2xl text-gray-300 transition-all duration-1200 ease-out delay-300 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="typing-animation">Відкрийте майбутнє цифрового мистецтва</span>
          </p>


          <p 
            className={`text-lg text-gray-400 transition-all duration-1200 ease-out delay-600 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            Де кожен піксель стає шедевром
          </p>
        </div>
      </div>


      {stage >= 5 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-blue-600/40"
            style={{
              animation: 'expand 1s ease-out forwards'
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, transparent 30%, rgba(147, 51, 234, 0.1) 70%)',
              animation: 'expand 1.2s ease-out forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TransitionAnimation; 