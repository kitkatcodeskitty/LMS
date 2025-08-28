import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';


const ApprovalModal = ({
  isOpen,
  onClose,
  withdrawal,
  onSubmit,
  currency
}) => {
  const [transactionReference, setTransactionReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(transactionReference.trim());
      setTransactionReference('');
    } catch (error) {
      console.error('Error submitting approval:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTransactionReference('');
    onClose();
  };

  if (!withdrawal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Approve Withdrawal Request"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Withdrawal Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h4 className="font-medium text-green-900">Confirm Approval</h4>
          </div>
          <div className="space-y-1 text-sm text-green-800">
            <p><span className="font-medium">User:</span> {withdrawal.user.name}</p>
            <p><span className="font-medium">Amount:</span> {currency}{withdrawal.amount}</p>
            <p><span className="font-medium">Method:</span> {withdrawal.method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer'}</p>
          </div>
        </div>

        {/* Transaction Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction Reference (Optional)
          </label>
          <input
            type="text"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
            placeholder="Enter transaction reference number..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            This reference will be sent to the user for their records.
          </p>
        </div>

        {/* Payment Details Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-2">Payment Details</h5>
          {withdrawal.method === 'mobile_banking' ? (
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Provider:</span> {withdrawal.paymentDetails?.provider}</p>
              <p><span className="font-medium">Mobile:</span> {withdrawal.paymentDetails?.mobileNumber}</p>
              <p><span className="font-medium">Account Holder:</span> {withdrawal.paymentDetails?.accountHolderName}</p>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Bank:</span> {withdrawal.paymentDetails?.bankName}</p>
              <p><span className="font-medium">Account Number:</span> {withdrawal.paymentDetails?.accountNumber}</p>
              <p><span className="font-medium">Account Name:</span> {withdrawal.paymentDetails?.accountName}</p>
            </div>
          )}
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
                <li>The user will be notified of this approval</li>
                <li>The amount will be deducted from their withdrawable balance</li>
                <li>This action cannot be undone</li>
                <li>Please ensure payment is processed to the user</li>
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
            variant="success"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Approving...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Approve Withdrawal</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApprovalModal;