import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const RejectionReasonModal = ({
  isOpen,
  onClose,
  withdrawal,
  onSubmit,
  currency
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(rejectionReason.trim());
      setRejectionReason('');
    } catch (error) {
      console.error('Error submitting rejection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  const commonReasons = [
    'Insufficient documentation provided',
    'Invalid payment details',
    'Account verification required',
    'Suspicious activity detected',
    'Minimum withdrawal amount not met',
    'Payment method not supported',
    'User account under review',
    'Technical issues with payment processor'
  ];

  const handleReasonSelect = (reason) => {
    setRejectionReason(reason);
  };

  if (!withdrawal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Withdrawal Request"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Withdrawal Info */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="font-medium text-red-900">Confirm Rejection</h4>
          </div>
          <div className="space-y-1 text-sm text-red-800">
            <p><span className="font-medium">User:</span> {withdrawal.user.name}</p>
            <p><span className="font-medium">Amount:</span> {currency}{withdrawal.amount}</p>
            <p><span className="font-medium">Method:</span> {withdrawal.method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer'}</p>
          </div>
        </div>

        {/* Common Reasons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Common Rejection Reasons (Click to select)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {commonReasons.map((reason, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleReasonSelect(reason)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  rejectionReason === reason
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    rejectionReason === reason ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm">{reason}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason (Optional - provide specific details)
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter a specific reason for rejecting this withdrawal request..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            This reason will be sent to the user via notification and email.
          </p>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The user will be notified of this rejection</li>
                <li>The withdrawal amount will be returned to their available balance</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="danger"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Rejecting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Reject Withdrawal</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RejectionReasonModal;