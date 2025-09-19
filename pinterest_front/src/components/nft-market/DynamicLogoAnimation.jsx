import { useEffect, useState } from "react";

const DynamicLogoAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);
  const [logoScale, setLogoScale] = useState(0);
  const [logoRotation, setLogoRotation] = useState(0);
  const [energyRings, setEnergyRings] = useState([]);

  useEffect(() => {
    const generateEnergyRings = () => {
      const rings = [];
      for (let i = 0; i < 3; i++) {
        rings.push({
          id: i,
          size: 140 + i * 30,
          opacity: 0.25 - i * 0.08,
          delay: i * 150,
          speed: 1.5 + i * 0.3
        });
      }
      setEnergyRings(rings);
    };


    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 60; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 6 + 2,
          speedX: (Math.random() - 0.5) * 3,
          speedY: (Math.random() - 0.5) * 3,
          opacity: Math.random() * 0.8 + 0.2,
          color: `hsl(${Math.random() * 40 + 260}, 80%, 75%)`,
          delay: i * 20,
          pulse: Math.random() * 1.5 + 0.8
        });
      }
      setParticles(newParticles);
    };

    generateEnergyRings();
    generateParticles();


    const animationSequence = async () => {
      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 600));

      setStage(2);
      await new Promise(resolve => setTimeout(resolve, 1200));


      setStage(3);
      setLogoScale(1);
      setLogoRotation(360);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStage(4);
      await new Promise(resolve => setTimeout(resolve, 800));

      setStage(5);
      await new Promise(resolve => setTimeout(resolve, 600));

      onComplete();
    };

    animationSequence();


    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.speedX,
        y: particle.y + particle.speedY,
        opacity: particle.opacity + Math.sin(Date.now() * 0.0008 * particle.pulse) * 0.08,
        size: particle.size + Math.sin(Date.now() * 0.0015 * particle.pulse) * 1.2
      })));
    };

    const particleInterval = setInterval(animateParticles, 50);

    const animateRings = () => {
      setEnergyRings(prev => prev.map(ring => ({
        ...ring,
        opacity: 0.25 - ring.id * 0.08 + Math.sin(Date.now() * 0.0006 * ring.speed) * 0.06
      })));
    };

    const ringInterval = setInterval(animateRings, 80);

    return () => {
      clearInterval(particleInterval);
      clearInterval(ringInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">

      <div 
        className={`absolute inset-0 transition-all duration-600 ease-out ${
          stage >= 1 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900/30 to-pink-900/30' 
            : 'bg-transparent'
        }`}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full transition-all duration-1000 ease-out ${
            stage >= 1 
              ? 'bg-gradient-to-r from-purple-600/25 to-pink-600/25 blur-2xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 2.5s ease-in-out infinite, rotate 18s linear infinite' : 'none'
          }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full transition-all duration-1000 ease-out delay-150 ${
            stage >= 1 
              ? 'bg-gradient-to-r from-blue-600/25 to-purple-600/25 blur-2xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 2.5s ease-in-out infinite 1s, rotate 15s linear infinite reverse' : 'none'
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
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                animation: 'float 2.5s ease-in-out infinite',
                transition: `opacity 0.6s ease-out ${particle.delay}ms`,
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
          className={`text-center transition-all duration-1000 ease-out ${
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
                  className="absolute border border-purple-400 rounded-full"
                  style={{
                    width: `${ring.size}px`,
                    height: `${ring.size}px`,
                    top: `-${ring.size / 2}px`,
                    left: `-${ring.size / 2}px`,
                    opacity: ring.opacity,
                    animation: `rotate ${2.5 + ring.id * 0.5}s linear infinite, pulse ${1.8 + ring.id * 0.3}s ease-in-out infinite`,
                    animationDelay: `${ring.delay}ms`
                  }}
                />
              ))}
            </div>
          )}

          <div className="relative mb-6">
            <div 
              className={`w-32 h-32 mx-auto rounded-2xl transition-all duration-1000 ease-out ${
                stage >= 3 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 scale-100 shadow-xl shadow-purple-500/50' 
                  : 'bg-transparent scale-0'
              }`}
              style={{
                backgroundSize: '200% 200%',
                animation: stage >= 3 ? 'gradient-shift 2.5s ease-in-out infinite, glow 2s ease-in-out infinite' : 'none',
                transform: `scale(${logoScale}) rotate(${logoRotation}deg)`
              }}
            >

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-2xl font-bold">NFT</div>
              </div>
            </div>
            
            {stage >= 3 && (
              <>
                <div 
                  className="absolute inset-0 w-32 h-32 rounded-2xl border border-purple-400/60"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite, rotate 8s linear infinite'
                  }}
                />
                <div 
                  className="absolute inset-0 w-32 h-32 rounded-2xl border border-pink-400/60"
                  style={{
                    animation: 'pulse 2s ease-in-out infinite 0.5s, rotate 6s linear infinite reverse'
                  }}
                />
              </>
            )}
          </div>


          <h1 
            className={`text-4xl font-bold mb-3 transition-all duration-1000 ease-out ${
              stage >= 3 
                ? 'text-white opacity-100 translate-y-0' 
                : 'text-transparent opacity-0 translate-y-6'
            }`}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
              NeonNFT
            </span>
          </h1>

          <p 
            className={`text-lg text-gray-300 transition-all duration-1000 ease-out delay-200 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-6'
            }`}
          >
            Ласкаво просимо назад!
          </p>
        </div>
      </div>

      {stage >= 5 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/25 via-pink-600/25 to-blue-600/25"
            style={{
              animation: 'expand 0.8s ease-out forwards'
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, transparent 40%, rgba(147, 51, 234, 0.08) 80%)',
              animation: 'expand 1s ease-out forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DynamicLogoAnimation;
