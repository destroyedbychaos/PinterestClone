import { useEffect, useState } from "react";

const EnhancedLogoAnimation = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [logoState, setLogoState] = useState({
    scale: 0,
    rotation: 0,
    glow: 0
  });
  const [particles, setParticles] = useState([]);
  const [energyRings, setEnergyRings] = useState([]);

  useEffect(() => {

    const generateEnergyRings = () => {
      const rings = [];
      for (let i = 0; i < 4; i++) {
        rings.push({
          id: i,
          radius: 200 + i * 80,
          opacity: 0.25 - i * 0.06,
          speed: 0.8 + i * 0.15,
          delay: i * 200
        });
      }
      setEnergyRings(rings);
    };


    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 80; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 6 + 2,
          speedX: (Math.random() - 0.5) * 2.5,
          speedY: (Math.random() - 0.5) * 2.5,
          opacity: Math.random() * 0.7 + 0.3,
          color: `hsl(${Math.random() * 40 + 260}, 85%, 75%)`,
          delay: i * 15,
          pulse: Math.random() * 1.5 + 0.8,
          orbit: Math.random() > 0.4
        });
      }
      setParticles(newParticles);
    };

    generateEnergyRings();
    generateParticles();

    const animationSequence = async () => {

      setStage(1);
      await new Promise(resolve => setTimeout(resolve, 1000));


      setStage(2);
      setLogoState(prev => ({ ...prev, scale: 1, rotation: 360 }));
      await new Promise(resolve => setTimeout(resolve, 1500));


      setStage(3);
      setLogoState(prev => ({ ...prev, glow: 1 }));
      await new Promise(resolve => setTimeout(resolve, 1200));

      setStage(4);
      await new Promise(resolve => setTimeout(resolve, 1500));


      setStage(5);
      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete();
    };

    animationSequence();


    const animateParticles = () => {
      setParticles(prev => prev.map(particle => {
        if (particle.orbit) {

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const angle = Date.now() * 0.0006 * particle.pulse;
          const radius = 150 + particle.id * 3;
          return {
            ...particle,
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            opacity: particle.opacity + Math.sin(Date.now() * 0.0008 * particle.pulse) * 0.15,
            size: particle.size + Math.sin(Date.now() * 0.0015 * particle.pulse) * 1.2
          };
        } else {

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const attraction = Math.max(0, (1200 - distance) / 1200) * 0.05;
          
          return {
            ...particle,
            x: particle.x + particle.speedX + dx * attraction,
            y: particle.y + particle.speedY + dy * attraction,
            opacity: particle.opacity + Math.sin(Date.now() * 0.0008 * particle.pulse) * 0.08,
            size: particle.size + Math.sin(Date.now() * 0.0015 * particle.pulse) * 0.8
          };
        }
      }));
    };

    const particleInterval = setInterval(animateParticles, 50);


    const animateRings = () => {
      setEnergyRings(prev => prev.map(ring => ({
        ...ring,
        opacity: ring.opacity + Math.sin(Date.now() * 0.0004 * ring.speed) * 0.08
      })));
    };

    const ringInterval = setInterval(animateRings, 80);

    return () => {
      clearInterval(particleInterval);
      clearInterval(ringInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center overflow-hidden">
      <div 
        className={`absolute inset-0 transition-all duration-1500 ease-in-out ${
          stage >= 1 
            ? 'bg-gradient-to-br from-gray-900 via-purple-900/40 to-pink-900/30 opacity-100' 
            : 'bg-gray-900 opacity-0'
        }`}
      />


      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/4 left-1/4 w-80 h-80 rounded-full transition-all duration-1500 ease-in-out ${
            stage >= 1 
              ? 'bg-gradient-to-r from-purple-600/25 to-pink-600/25 blur-2xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 3s ease-in-out infinite, rotate 25s linear infinite' : 'none'
          }}
        />
        <div 
          className={`absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full transition-all duration-1500 ease-in-out delay-300 ${
            stage >= 1 
              ? 'bg-gradient-to-r from-blue-600/25 to-purple-600/25 blur-2xl scale-100' 
              : 'bg-transparent scale-0'
          }`}
          style={{
            animation: stage >= 1 ? 'pulse 3s ease-in-out infinite 1.5s, rotate 20s linear infinite reverse' : 'none'
          }}
        />
      </div>


      {stage >= 3 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {energyRings.map(ring => (
            <div
              key={ring.id}
              className="absolute border border-purple-400/60 rounded-full"
              style={{
                width: `${ring.radius}px`,
                height: `${ring.radius}px`,
                top: `-${ring.radius / 2}px`,
                left: `-${ring.radius / 2}px`,
                opacity: ring.opacity,
                animation: `energy-ring-pulse ${2.5 + ring.id * 0.3}s ease-in-out infinite, rotate ${18 + ring.id * 2}s linear infinite`,
                animationDelay: `${ring.delay}ms`
              }}
            />
          ))}
        </div>
      )}


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
                animation: 'float 3s ease-in-out infinite',
                transition: `opacity 1s ease-in-out ${particle.delay}ms`,
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
        <div className="text-center">

          <div className="relative mb-8">
            <div 
              className={`w-48 h-48 mx-auto rounded-3xl transition-all duration-2000 ease-in-out ${
                stage >= 2 
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 scale-100 shadow-xl' 
                  : 'bg-transparent scale-0'
              }`}
              style={{
                backgroundSize: '200% 200%',
                animation: stage >= 2 ? 'gradient-shift 4s ease-in-out infinite, logo-glow-intense 3s ease-in-out infinite' : 'none',
                transform: `scale(${logoState.scale}) rotate(${logoState.rotation}deg)`,
                boxShadow: stage >= 3 ? 
                  `0 0 25px rgba(147, 51, 234, 0.6),
                   0 0 50px rgba(236, 72, 153, 0.4),
                   0 0 75px rgba(59, 130, 246, 0.3)` : 'none'
              }}
            >
  
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-6xl font-bold tracking-wider">NFT</div>
              </div>
            </div>
            
            {stage >= 3 && (
              <>
                <div 
                  className="absolute inset-0 w-48 h-48 rounded-3xl border-2 border-purple-400/50"
                  style={{
                    animation: 'pulse 3s ease-in-out infinite, rotate 20s linear infinite'
                  }}
                />
                <div 
                  className="absolute inset-0 w-48 h-48 rounded-3xl border border-pink-400/50"
                  style={{
                    animation: 'pulse 3s ease-in-out infinite 1.5s, rotate 15s linear infinite reverse'
                  }}
                />
              </>
            )}
          </div>

          <h1 
            className={`text-6xl md:text-7xl font-bold mb-6 transition-all duration-2000 ease-in-out ${
              stage >= 2 
                ? 'text-white opacity-100 translate-y-0' 
                : 'text-transparent opacity-0 translate-y-8'
            }`}
          >
            <span 
              className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent"
              style={{
                animation: stage >= 4 ? 'shimmer 4s ease-in-out infinite' : 'none'
              }}
            >
              NeonNFT
            </span>
          </h1>

          <p 
            className={`text-2xl text-gray-300 transition-all duration-2000 ease-in-out delay-400 ${
              stage >= 4 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <span 
              className="typing-animation"
              style={{
                animationDelay: '0.8s'
              }}
            >
              Відкрийте майбутнє цифрового мистецтва
            </span>
          </p>
        </div>
      </div>


      {stage >= 5 && (
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-blue-600/30"
            style={{
              animation: 'expand 2s ease-in-out forwards'
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle, transparent 30%, rgba(147, 51, 234, 0.15) 70%)',
              animation: 'expand 2.5s ease-in-out forwards'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EnhancedLogoAnimation;
