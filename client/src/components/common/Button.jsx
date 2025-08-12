import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 shadow-sm hover:shadow-md',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-sm hover:shadow-md',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 shadow-sm hover:shadow-md',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-rose-500 text-rose-500 hover:bg-rose-50 focus:ring-rose-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="white" text="" className="mr-2" />
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;