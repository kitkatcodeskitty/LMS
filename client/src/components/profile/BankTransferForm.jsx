import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../common/Button';
import { validateRequired } from '../../utils/apiHelpers';

const BankTransferForm = ({ availableBalance, onBack, onSuccess, loading, setLoading }) => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
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

  const popularBanks = [
    'Nepal Rastra Bank',
    'Nepal Investment Bank',
    'Standard Chartered Bank Nepal',
    'Himalayan Bank',
    'Nepal SBI Bank',
    'Everest Bank',
    'Bank of Kathmandu',
    'Nabil Bank',
    'Nepal Bangladesh Bank',
    'Citizens Bank International',
    'Prime Commercial Bank',
    'Sunrise Bank',
    'Century Commercial Bank',
    'Sanima Bank',
    'Machhapuchchhre Bank',
    'Kumari Bank',
    'Laxmi Sunrise Bank',
    'Siddhartha Bank',
    'Global IME Bank',
    'NIC Asia Bank',
    'Prabhu Bank',
    'Mega Bank Nepal',
    'Civil Bank',
    'Other'
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
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      bankName: formData.bankName,
      amount: formData.amount
    };

    const requiredErrors = validateRequired(requiredFields);
    Object.assign(newErrors, requiredErrors);

    // Account number validation (basic format check)
    if (formData.accountNumber && !/^[A-Za-z0-9]{8,20}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 8-20 characters (letters and numbers only)';
    }

    // Amount validation
    const amount = parseFloat(formData.amount);
    const avail = balance ?? availableBalance;
    if (formData.amount) {
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      } else if (avail != null && amount > avail) {
        newErrors.amount = `Amount cannot exceed available balance of ${currency}${avail}`;
      } else if (amount < 500) {
        newErrors.amount = `Minimum withdrawal amount for bank transfer is ${currency}500`;
      }
    }

    // Account name validation
    if (formData.accountName && formData.accountName.length < 2) {
      newErrors.accountName = 'Account name must be at least 2 characters';
    }

    // Bank name validation
    if (formData.bankName && formData.bankName.length < 2) {
      newErrors.bankName = 'Bank name must be at least 2 characters';
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
        method: 'bank_transfer',
        amount: parseFloat(formData.amount),
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
          toast.error(`${data.error.message} Details: ${JSON.stringify(data.error.details)}`);
        } else {
          toast.error(data.error?.message || 'Failed to submit withdrawal request');
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
          </label>
          <select
            id="bankName"
            name="bankName"
            value={formData.bankName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              errors.bankName ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select your bank</option>
            {popularBanks.map(bank => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          {errors.bankName && (
            <p className="text-red-500 text-sm mt-1">{errors.bankName}</p>
          )}
          {formData.bankName === 'Other' && (
            <input
              type="text"
              placeholder="Enter bank name"
              value=""
              onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mt-2"
            />
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
              min="500"
              step="0.01"
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
  );
};

export default BankTransferForm;