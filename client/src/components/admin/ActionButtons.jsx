import React from 'react';
import Button from '../common/Button';

const ActionButtons = ({ 
  withdrawal, 
  onAction, 
  size = 'sm', 
  layout = 'vertical',
  showLabels = false,
  disabled = false 
}) => {
  const handleApprove = () => {
    onAction('approve', withdrawal._id);
  };

  const handleReject = () => {
    onAction('reject', withdrawal._id);
  };

  const handleEdit = () => {
    onAction('edit', withdrawal._id);
  };

  const buttonSize = size;
  const isHorizontal = layout === 'horizontal';
  const containerClass = isHorizontal 
    ? 'flex flex-row gap-3 justify-center' 
    : 'flex flex-col gap-2';

  // Only show action buttons for pending withdrawals
  if (withdrawal.status !== 'pending') {
    return null;
  }

  return (
    <div className={containerClass}>
      <Button
        variant="info"
        size={buttonSize}
        onClick={handleEdit}
        disabled={disabled}
        className={isHorizontal ? 'flex-1' : 'w-full'}
      >
        {showLabels ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Edit Details</span>
          </div>
        ) : (
          'Edit'
        )}
      </Button>
      
      <Button
        variant="success"
        size={buttonSize}
        onClick={handleApprove}
        disabled={disabled}
        className={isHorizontal ? 'flex-1' : 'w-full'}
      >
        {showLabels ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Approve Withdrawal</span>
          </div>
        ) : (
          'Approve'
        )}
      </Button>
      
      <Button
        variant="danger"
        size={buttonSize}
        onClick={handleReject}
        disabled={disabled}
        className={isHorizontal ? 'flex-1' : 'w-full'}
      >
        {showLabels ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Reject Withdrawal</span>
          </div>
        ) : (
          'Reject'
        )}
      </Button>
    </div>
  );
};

export default ActionButtons;