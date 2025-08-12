import React from 'react';
import useCountAnimation from '../../hooks/useCountAnimation';

const AnimatedNumber = ({ 
  value, 
  currency = '', 
  decimals = 2, 
  duration = 2000, 
  delay = 0,
  className = '',
  prefix = '',
  suffix = ''
}) => {
  const animatedValue = useCountAnimation(value, duration, delay);

  const formatNumber = (num) => {
    if (decimals === 0) {
      return Math.floor(num).toLocaleString();
    }
    return num.toFixed(decimals);
  };

  return (
    <span className={className}>
      {prefix}{currency}{formatNumber(animatedValue)}{suffix}
    </span>
  );
};

export default AnimatedNumber;