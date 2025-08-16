import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ValidatedInput from '../common/ValidatedInput';
import ValidatedSelect from '../common/ValidatedSelect';

const WithdrawalEditForm = ({
  isOpen,
  onClose,
  withdrawal,
  onSubmit,
  currency,
  formatMethod
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    mobileBankingDetails: {
      accountHolderName: '',
      mobileNumber: '',
      provider: ''
    },
    bankTransferDetails: {
      accountName: '',
      accountNumber: '',
      bankName: ''
    }
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when withdrawal changes
  useEffect(() => {
    if (withdrawal) {
      setFormData({
        amount: withdrawal.amount.toString(),
        mobileBankingDetails: {
          accountHolderName: withdrawal.paymentDetails?.accountHolderName || '',
          mobileNumber: withdrawal.paymentDetails?.mobileNumber || '',
          provider: withdrawal.paymentDetails?.provider || ''
        },
        bankTransferDetails: {
          accountName: withdrawal.paymentDetails?.accountName || '',
          accountNumber: withdrawal.paymentDetails?.accountNumber || '',
          bankName: withdrawal.paymentDetails?.bankName || ''
        }
      });
      setErrors({});
    }
  }, [withdrawal]);

  const validateForm = () => {
    const newErrors = {};

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    // Validate payment method specific fields
    if (withdrawal?.method === 'mobile_banking') {
      if (!formData.mobileBankingDetails.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required';
      }
      if (!formData.mobileBankingDetails.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobileBankingDetails.mobileNumber.replace(/\D/g, ''))) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }
      if (!formData.mobileBankingDetails.provider) {
        newErrors.provider = 'Please select a provider';
      }
    } else if (withdrawal?.method === 'bank_transfer') {
      if (!formData.bankTransferDetails.accountName.trim()) {
        newErrors.accountName = 'Account name is required';
      }
      if (!formData.bankTransferDetails.accountNumber.trim()) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.bankTransferDetails.bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        amount: parseFloat(formData.amount)
      };

      // Add payment method specific details
      if (withdrawal.method === 'mobile_banking') {
        submitData.mobileBankingDetails = formData.mobileBankingDetails;
      } else if (withdrawal.method === 'bank_transfer') {
        submitData.bankTransferDetails = formData.bankTransferDetails;
      }

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting edit form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'amount') {
      setFormData(prev => ({ ...prev, amount: value }));
    } else if (field.startsWith('mobileBanking.')) {
      const subField = field.replace('mobileBanking.', '');
      setFormData(prev => ({
        ...prev,
        mobileBankingDetails: {
          ...prev.mobileBankingDetails,
          [subField]: value
        }
      }));
    } else if (field.startsWith('bankTransfer.')) {
      const subField = field.replace('bankTransfer.', '');
      setFormData(prev => ({
        ...prev,
        bankTransferDetails: {
          ...prev.bankTransferDetails,
          [subField]: value
        }
      }));
    }

    // Clear error for this field
    if (errors[field.split('.').pop()]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field.split('.').pop()];
        return newErrors;
      });
    }
  };

  const mobileProviderOptions = [
    { value: '', label: 'Select Provider' },
    { value: 'eSewa', label: 'eSewa' },
    { value: 'Khalti', label: 'Khalti' },
    { value: 'IME Pay', label: 'IME Pay' },
    { value: 'ConnectIPS', label: 'ConnectIPS' },
    { value: 'Other', label: 'Other' }
  ];

  if (!withdrawal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Withdrawal Details"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Withdrawal Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Withdrawal</h4>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">User:</span> {withdrawal.user.name}</p>
            <p><span className="font-medium">Original Amount:</span> {currency}{withdrawal.amount}</p>
            <p><span className="font-medium">Method:</span> {formatMethod(withdrawal.method)}</p>
          </div>
        </div>

        {/* Amount Field */}
        <div>
          <ValidatedInput
            name="amount"
            label="Withdrawal Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            error={errors.amount}
            min="1"
            step="0.01"
            required
            placeholder="Enter withdrawal amount"
          />
        </div>

        {/* Payment Method Specific Fields */}
        {withdrawal.method === 'mobile_banking' && (
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Mobile Banking Details
            </h5>
            
            <ValidatedInput
              name="accountHolderName"
              label="Account Holder Name"
              type="text"
              value={formData.mobileBankingDetails.accountHolderName}
              onChange={(e) => handleInputChange('mobileBanking.accountHolderName', e.target.value)}
              error={errors.accountHolderName}
              required
              placeholder="Enter account holder name"
            />

            <ValidatedInput
              name="mobileNumber"
              label="Mobile Number"
              type="tel"
              value={formData.mobileBankingDetails.mobileNumber}
              onChange={(e) => handleInputChange('mobileBanking.mobileNumber', e.target.value)}
              error={errors.mobileNumber}
              required
              placeholder="Enter mobile number"
            />

            <ValidatedSelect
              name="provider"
              label="Provider"
              value={formData.mobileBankingDetails.provider}
              onChange={(e) => handleInputChange('mobileBanking.provider', e.target.value)}
              options={mobileProviderOptions}
              error={errors.provider}
              required
            />
          </div>
        )}

        {withdrawal.method === 'bank_transfer' && (
          <div className="space-y-4">
            <h5 className="font-medium text-gray-900 border-b border-gray-200 pb-2">
              Bank Transfer Details
            </h5>
            
            <ValidatedInput
              name="accountName"
              label="Account Name"
              type="text"
              value={formData.bankTransferDetails.accountName}
              onChange={(e) => handleInputChange('bankTransfer.accountName', e.target.value)}
              error={errors.accountName}
              required
              placeholder="Enter account name"
            />

            <ValidatedInput
              name="accountNumber"
              label="Account Number"
              type="text"
              value={formData.bankTransferDetails.accountNumber}
              onChange={(e) => handleInputChange('bankTransfer.accountNumber', e.target.value)}
              error={errors.accountNumber}
              required
              placeholder="Enter account number"
            />

            <ValidatedInput
              name="bankName"
              label="Bank Name"
              type="text"
              value={formData.bankTransferDetails.bankName}
              onChange={(e) => handleInputChange('bankTransfer.bankName', e.target.value)}
              error={errors.bankName}
              required
              placeholder="Enter bank name"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default WithdrawalEditForm;