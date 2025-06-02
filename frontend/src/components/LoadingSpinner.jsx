import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = '#592538' }) => {
  const sizeMap = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  return (
    <div className="flex justify-center items-center">
      <div className={`${spinnerSize} border-4 border-t-4 border-gray-200 rounded-full animate-spin`} 
           style={{ borderTopColor: color }}></div>
    </div>
  );
};

export default LoadingSpinner;
