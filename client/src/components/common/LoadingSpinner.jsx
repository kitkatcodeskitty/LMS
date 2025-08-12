import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  color = 'blue', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    rose: 'border-rose-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    gray: 'border-gray-500'
  };

  const spinner = (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          {spinner}
          {text && <p className="text-gray-600 text-lg font-medium mt-4">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        {spinner}
        {text && <p className="text-gray-600 text-sm mt-2">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;