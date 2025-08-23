import React from 'react';

const UploadProgress = ({ 
  progress = 0, 
  status = 'uploading', 
  fileName = '',
  onCancel = null,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'success':
        return 'Upload Complete!';
      case 'error':
        return 'Upload Failed';
      default:
        return 'Preparing...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📁';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {fileName || 'File Upload'}
            </p>
            <p className="text-xs text-gray-500">{getStatusText()}</p>
          </div>
        </div>
        
        {onCancel && status === 'uploading' && (
          <button
            onClick={onCancel}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {status === 'uploading' ? `${Math.round(progress)}%` : status}
        </span>
        
        {status === 'uploading' && (
          <span className="text-xs text-gray-400">
            {progress < 100 ? 'Processing...' : 'Finalizing...'}
          </span>
        )}
      </div>
    </div>
  );
};

export default UploadProgress;
