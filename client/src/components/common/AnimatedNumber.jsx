import React from 'react';
import useCountAnimation from '../../hooks/useCountAnimation';

const AnimatedNumber = ({ 
  value, 
  currency = '', 
  duration = 2000, 
  delay = 0,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const animatedValue = useCountAnimation(value, duration, delay);

  const formatNumber = (num) => {
    // Always round to whole numbers
    return Math.round(num).toLocaleString();
  };

  return (
    <span className={className}>
      {prefix}{currency}{formatNumber(animatedValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;