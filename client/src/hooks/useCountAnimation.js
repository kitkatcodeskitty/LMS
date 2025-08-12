import { useState, useEffect } from 'react';

const useCountAnimation = (targetValue, duration = 2000, delay = 0) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (targetValue === 0) {
      setCurrentValue(0);
      return;
    }

    const timer = setTimeout(() => {
      let startTime = null;
      const startValue = 0;
      const endValue = targetValue;

      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const value = startValue + (endValue - startValue) * easeOutQuart;
        
        setCurrentValue(value);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [targetValue, duration, delay]);

  return currentValue;
};

export default useCountAnimation;