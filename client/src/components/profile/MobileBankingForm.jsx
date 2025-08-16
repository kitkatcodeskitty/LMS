import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../common/Button';
import { validateRequired } from '../../utils/apiHelpers';

const MobileBankingForm = ({ availableBalance, onBack, onSuccess, loading, setLoading }) => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    mobileNumber: '',
    provider: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [balance, setBalance] = useState(availableBalance ?? null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  const providers = [
    { value: 'eSewa', label: 'eSewa' },
    { value: 'Khalti', label: 'Khalti' },
    { value: 'IME Pay', label: 'IME Pay' },
    { value: 'ConnectIPS', label: 'ConnectIPS' },
    { value: 'Other', label: 'Other' }
  ];

  // Fetch balance if not provided
  useEffect(() => {
    if (balance == null) {
      setFetchingBalance(true);
      const token = getToken();
      axios.get(`${backendUrl}/api/withdrawals/available-balance`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.data.success) {
            setBalance(res.data.data.availableBalance);
            setBalanceError(null);
          } else {
            setBalanceError('Failed to fetch balance');
          }
        })
        .catch(err => {
          setBalanceError('Failed to fetch balance');
        })
        .finally(() => setFetchingBalance(false));
    }
  }, [balance, backendUrl, getToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    const requiredFields = {
      accountHolderName: formData.accountHolderName,
      mobileNumber: formData.mobileNumber,
      provider: formData.provider,
      amount: formData.amount
    };

    const requiredErrors = validateRequired(requiredFields);
    Object.assign(newErrors, requiredErrors);

    // Mobile number validation (Nepali format)
    if (formData.mobileNumber && !/^(98|97)\d{8}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid Nepali mobile number (98XXXXXXXX or 97XXXXXXXX)';
    }

    // Amount validation
    const amount = parseFloat(formData.amount);
    const avail = balance ?? availableBalance;
    if (formData.amount) {
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (avail != null && amount > avail) {
        newErrors.amount = `Amount cannot exceed available balance of ${currency}${avail}`;
      } else if (amount < 100) {
        newErrors.amount = `Minimum withdrawal amount for mobile banking is ${currency}100`;
      }
    }

    // Account holder name validation
    if (formData.accountHolderName && formData.accountHolderName.length < 2) {
      newErrors.accountHolderName = 'Account holder name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (balanceError) {
      toast.error('Cannot submit: failed to fetch balance');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const requestData = {
        method: 'mobile_banking',
        amount: parseFloat(formData.amount),
        mobileBankingDetails: {
          accountHolderName: formData.accountHolderName.trim(),
          mobileNumber: formData.mobileNumber.trim(),
          provider: formData.provider
        }
      };

      const { data } = await axios.post(
        `${backendUrl}/api/withdrawals/request`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        onSuccess();
      } else {
        // Show detailed backend error if available
        if (data.error?.details) {
          toast.error(`${data.error.message} Details: ${JSON.stringify(data.error.details)}`);
        } else {
          toast.error(data.error?.message || 'Failed to submit withdrawal request');
        }
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          'Failed to submit withdrawal request';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fetchingBalance && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">Fetching balance...</div>
      )}
      {balanceError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center text-red-700">{balanceError}</div>
      )}
      {/* Back Button */}
      <div className="flex items-center space-x-2 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to methods</span>
        </button>
      </div>

      {/* Method Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Mobile Banking Withdrawal</h3>
          <p className="text-sm text-gray-600">Available: {currency}{balance !== null ? balance : availableBalance}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Account Holder Name */}
        <div>
          <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <input
            type="text"
            id="accountHolderName"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleInputChange}
            placeholder="Enter account holder name"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.accountHolderName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.accountHolderName && (
            <p className="text-red-500 text-sm mt-1">{errors.accountHolderName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Mobile Number *
          </label>
          <input
            type="text"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleInputChange}
            placeholder="98XXXXXXXX or 97XXXXXXXX"
            maxLength="10"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.mobileNumber ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.mobileNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.mobileNumber}</p>
          )}
        </div>

        {/* Provider */}
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700 mb-1">
            Payment Provider *
          </label>
          <select
            id="provider"
            name="provider"
            value={formData.provider}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.provider ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select provider</option>
            {providers.map(provider => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
          {errors.provider && (
            <p className="text-red-500 text-sm mt-1">{errors.provider}</p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Amount *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">{currency}</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="100"
              step="0.01"
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {currency}100 | Available: {currency}{balance !== null ? balance : availableBalance}
          </p>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ensure the mobile number is linked to your selected payment provider</li>
              <li>• Processing time: 1-3 business days</li>
              <li>• You'll receive a notification once processed</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          Submit Request
        </Button>
      </div>
    </form>
  );
};

export default MobileBankingForm;