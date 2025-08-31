import React from 'react';

const SpikyVerificationBadge = ({ 
  size = 'w-4 h-4', 
  gradientId = 'blueGradientDefault',
  className = '' 
}) => {
  return (
    <div className={`${size} flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path
          d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M35 52 L45 62 L70 38"
          stroke="white"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SpikyVerificationBadge;