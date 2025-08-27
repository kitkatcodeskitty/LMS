import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import Button from '../common/Button';
import { validateRequired } from '../../utils/apiHelpers';

const BankTransferForm = ({ availableBalance, onBack, onSuccess, loading, setLoading }) => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  
  // Add CSS animation styles
  const animationStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `;
  
  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    amount: ''
  });
  const [errors, setErrors] = useState({});
  const [balance, setBalance] = useState(availableBalance ?? null);
  const [fetchingBalance, setFetchingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

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
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      amount: formData.amount
    };

    const requiredErrors = validateRequired(requiredFields);
    Object.assign(newErrors, requiredErrors);

    // Bank name validation
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Please enter your bank name';
    } else if (formData.bankName.trim().length < 3) {
      newErrors.bankName = 'Bank name must be at least 3 characters';
    }

    // Account number validation
    if (formData.accountNumber && !/^[A-Za-z0-9]{8,20}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 8-20 characters, letters and numbers only';
    }

    // Amount validation
    if (formData.amount) {
      const amount = parseInt(formData.amount, 10);
      if (isNaN(amount) || amount < 500) {
        newErrors.amount = `Minimum withdrawal amount is ${currency} 500`;
      } else if (amount % 1 !== 0) {
        newErrors.amount = 'Amount must be a whole number (no decimals)';
      } else if (amount > (balance || availableBalance)) {
        newErrors.amount = 'Amount exceeds available balance';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (balanceError) {
      console.error('Cannot submit: failed to fetch balance');
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      const requestData = {
        method: 'bank_transfer',
        amount: parseInt(formData.amount, 10),
        bankTransferDetails: {
          accountName: formData.accountName.trim(),
          accountNumber: formData.accountNumber.trim(),
          bankName: formData.bankName.trim()
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
          console.error(`${data.error.message} Details: ${JSON.stringify(data.error.details)}`);
        } else {
          console.error(data.error?.message || 'Failed to submit withdrawal request');
        }
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      let errorMessage;
      if (error.response?.status === 429) {
        errorMessage = 'You are submitting requests too quickly. Please wait a moment and try again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action. Please log in again or check your permissions.';
      } else {
        errorMessage = error.response?.data?.error?.message || 
                       error.response?.data?.message || 
                       'Failed to submit withdrawal request';
      }
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{animationStyles}</style>
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
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Bank Transfer Withdrawal</h3>
          <p className="text-sm text-gray-600">Available: {currency}{balance !== null ? balance : availableBalance}</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Account Name */}
        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name *
          </label>
          <input
            type="text"
            id="accountName"
            name="accountName"
            value={formData.accountName}
            onChange={handleInputChange}
            placeholder="Enter full name as per bank account"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.accountName ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.accountName && (
            <p className="text-red-500 text-sm mt-1">{errors.accountName}</p>
          )}
        </div>

        {/* Account Number */}
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Account Number *
          </label>
          <input
            type="text"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            placeholder="Enter bank account number"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.accountNumber ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.accountNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            8-20 characters, letters and numbers only
          </p>
        </div>

        {/* Bank Name */}
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name *
            <span className="ml-2 text-xs text-gray-500 font-normal">
              💡 Enter the exact name of your bank
            </span>
          </label>
          
          {/* Manual Bank Name Input */}
          <div className="space-y-3">
            <input
              type="text"
              id="bankName"
              name="bankName"
              placeholder="e.g., Nepal Investment Bank, Standard Chartered Bank Nepal"
              value={formData.bankName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                errors.bankName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            
            {/* Helpful Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <span className="text-green-600 text-sm">💡</span>
                <div className="text-xs text-green-700">
                  <p className="font-medium mb-1">Tips for accurate bank name:</p>
                  <ul className="space-y-1">
                    <li>• Use the exact name from your bank statement</li>
                    <li>• Include "Bank", "Limited", "Co." if part of the name</li>
                    <li>• Avoid abbreviations unless official</li>
                    <li>• Examples: "Nepal Investment Bank", "Himalayan Bank Limited"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {errors.bankName && (
            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
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
              placeholder="500"
              min="500"
              step="1"
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Minimum: {currency}500 | Available: {currency}{balance !== null ? balance : availableBalance}
          </p>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Important:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ensure account details are accurate to avoid delays</li>
              <li>• Processing time: 2-5 business days</li>
              <li>• Bank charges may apply as per your bank's policy</li>
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
          variant="success"
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          Submit Request
        </Button>
      </div>
    </form>
    </>
  );
};

export default BankTransferForm;