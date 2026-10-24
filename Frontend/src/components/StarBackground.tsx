import React, { useMemo } from 'react';

const StarBackground = () => {
  // Memoize star positions to prevent recalculation on every render
  const stars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 3}s`,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            transform: 'translateZ(0)', // Force hardware acceleration
          }}
        />
      ))}
    </div>
  );
};

export default StarBackground;