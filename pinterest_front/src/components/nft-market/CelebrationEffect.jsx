import React, { useEffect, useState } from 'react';

const CelebrationEffect = ({ isActive, onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  const [sparkles, setSparkles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    try {
      const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316', '#06b6d4', '#fbbf24', '#34d399'];
      const newParticles = [];
      const newFireworks = [];
      const newSparkles = [];

      // Створюємо частинки салюта (вимкнено)
      // for (let i = 0; i < 120; i++) {
      //   newParticles.push({
      //     id: i,
      //     x: Math.random() * window.innerWidth,
      //     y: window.innerHeight + 10,
      //     vx: (Math.random() - 0.5) * 8,
      //     vy: -Math.random() * 15 - 10,
      //     rotation: Math.random() * 360,
      //     rotationSpeed: (Math.random() - 0.5) * 20,
      //     color: colors[Math.floor(Math.random() * colors.length)],
      //     size: Math.random() * 8 + 4,
      //     opacity: 1,
      //     shape: Math.random() > 0.5 ? 'square' : 'circle',
      //     delay: Math.random() * 1500
      //   });
      // }

      // Створюємо феєрверки
      for (let i = 0; i < 20; i++) {
        newFireworks.push({
          id: `firework-${i}`,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight,
          vy: -Math.random() * 8 - 5, // Швидкість руху вгору
          particles: [],
          exploded: false,
          delay: Math.random() * 1500
        });
      }

      // Створюємо іскорки (вимкнено)
      // for (let i = 0; i < 80; i++) {
      //   newSparkles.push({
      //     id: `sparkle-${i}`,
      //     x: Math.random() * window.innerWidth,
      //     y: Math.random() * window.innerHeight,
      //     size: Math.random() * 3 + 1,
      //     opacity: 1,
      //     delay: Math.random() * 2000
      //   });
      // }

      setParticles(newParticles);
      setFireworks(newFireworks);
      setSparkles(newSparkles);

      // Автоматичне видалення ефекту через 5 секунд
      const timer = setTimeout(() => {
        setParticles([]);
        setFireworks([]);
        setSparkles([]);
        if (onComplete) onComplete();
      }, 5000);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Error in CelebrationEffect:', err);
      setError(err.message);
      if (onComplete) onComplete();
    }
  }, [isActive, onComplete]);

  useEffect(() => {
    if (particles.length === 0 && sparkles.length === 0 && fireworks.length === 0) return;

    try {
      const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#f97316', '#06b6d4', '#fbbf24', '#34d399'];

      const animationFrame = requestAnimationFrame(() => {
        // Анімація частинок салюта (вимкнено)
        // setParticles(prev => 
        //   prev.map(particle => ({
        //     ...particle,
        //     x: particle.x + particle.vx,
        //     y: particle.y + particle.vy,
        //     vy: particle.vy + 0.2, // Гравітація
        //     rotation: particle.rotation + particle.rotationSpeed,
        //     opacity: particle.opacity - 0.006
        //   })).filter(particle => particle.y > -100 && particle.opacity > 0)
        // );

        // Анімація феєрверків
        setFireworks(prev => 
          prev.map(firework => {
            if (!firework.exploded) {
              // Рухаємо феєрверк вгору
              const newY = firework.y + firework.vy;
              
              if (newY < window.innerHeight * 0.3) {
                // Вибух феєрверка
                const explosionParticles = [];
                for (let i = 0; i < 50; i++) {
                  explosionParticles.push({
                    id: `${firework.id}-particle-${i}`,
                    x: firework.x,
                    y: newY,
                    vx: (Math.random() - 0.5) * 12,
                    vy: (Math.random() - 0.5) * 12,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: Math.random() * 8 + 4,
                    opacity: 1
                  });
                }
                return { ...firework, y: newY, exploded: true, particles: explosionParticles };
              }
              
              return { ...firework, y: newY };
            }
            
            // Анімація частинок після вибуху
            if (firework.exploded && firework.particles.length > 0) {
              const updatedParticles = firework.particles.map(particle => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vy: particle.vy + 0.1, // Гравітація
                opacity: particle.opacity - 0.01
              })).filter(particle => particle.opacity > 0);
              
              return { ...firework, particles: updatedParticles };
            }
            
            return firework;
          })
        );

        // Анімація іскорок (вимкнено)
        // setSparkles(prev => 
        //   prev.map(sparkle => ({
        //     ...sparkle,
        //     opacity: sparkle.opacity - 0.003
        //   })).filter(sparkle => sparkle.opacity > 0)
        // );
      });

      return () => cancelAnimationFrame(animationFrame);
    } catch (err) {
      console.error('Error in CelebrationEffect animation:', err);
      setError(err.message);
    }
  }, [particles, sparkles, fireworks]);

  if (error) {
    console.error('CelebrationEffect error:', error);
    return null;
  }

  if (!isActive || (particles.length === 0 && sparkles.length === 0 && fireworks.length === 0)) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Феєрверки */}
      {fireworks.map(firework => 
        firework.particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`
            }}
          />
        ))
      )}

      {/* Іскорки (вимкнено) */}
      {/* {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute bg-yellow-300 rounded-full animate-ping"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            opacity: sparkle.opacity,
            animationDelay: `${sparkle.delay}ms`,
            boxShadow: `0 0 ${sparkle.size * 2}px #fbbf24`
          }}
        />
      ))} */}
    </div>
  );
};

export default CelebrationEffect;