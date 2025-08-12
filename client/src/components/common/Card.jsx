import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  rounded = 'lg'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div className={`bg-white ${paddingClasses[padding]} ${shadowClasses[shadow]} ${roundedClasses[rounded]} ${borderClass} ${hoverClass} ${className}`}>
      {children}
    </div>
  );
};

export default Card;