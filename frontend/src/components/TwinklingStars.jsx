import { useEffect, useRef } from 'react';

const TwinklingStars = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create random stars
    const starCount = 50;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'absolute rounded-full';
      
      // Random size (1-3px)
      const size = Math.random() * 2 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      // Random position
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      // Random color (white, purple, or cyan tint)
      const colors = [
        'rgba(255,255,255,0.8)',
        'rgba(255,255,255,0.6)',
        'rgba(168,85,247,0.6)',
        'rgba(34,211,238,0.5)',
      ];
      star.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      // Random animation delay and duration
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 5;
      star.style.animation = `starTwinkle ${duration}s ease-in-out infinite ${delay}s`;
      
      // Add glow effect to some stars
      if (Math.random() > 0.7) {
        star.style.boxShadow = `0 0 ${size * 2}px ${star.style.background}`;
      }
      
      container.appendChild(star);
      stars.push(star);
    }

    // Cleanup
    return () => {
      stars.forEach(star => star.remove());
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};

export default TwinklingStars;
