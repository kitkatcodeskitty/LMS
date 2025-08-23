import React, { useState, useEffect, useContext } from 'react';
import AnimatedNumber from '../common/AnimatedNumber';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  FaMoneyBillWave,
  FaUniversity,
  FaMobile,
  FaHistory,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaArrowRight,
  FaFileInvoice,
  FaCalendarAlt,
  FaReceipt
} from 'react-icons/fa';

const Withdrawal = ({ earningsData, currency, userData }) => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('withdraw');
  const [withdrawalMethod, setWithdrawalMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    accountHolderName: '',
    bankName: ''
  });
  const [mobileDetails, setMobileDetails] = useState({
    phoneNumber: '',
    paymentMethod: 'khalti',
    accountHolderName: ''
  });
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawalStatements, setWithdrawalStatements] = useState([]);

  // Safety checks
  const safeEarningsData = earningsData || {};
  const safeCurrency = currency || 'Rs ';
  const availableBalance = safeEarningsData.availableBalance || 0;
  const minWithdrawal = 500;

  // Fetch real withdrawal history from API
  const fetchWithdrawalHistory = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.get(
        `${backendUrl}/api/withdrawals/history`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const allWithdrawals = response.data.data.withdrawals || [];
        // FIXED: Proper status filtering based on backend enum values
        // Backend uses exact status values: 'pending', 'approved', 'rejected'
        const completedWithdrawals = allWithdrawals.filter(w => w.status === 'approved');
        const pendingWithdrawals = allWithdrawals.filter(w => w.status === 'pending');
        const rejectedWithdrawals = allWithdrawals.filter(w => w.status === 'rejected');

        // Combine pending and rejected for the "Pending Requests" tab
        const allPendingRequests = [...pendingWithdrawals, ...rejectedWithdrawals];

        setWithdrawalHistory(allPendingRequests);
        setWithdrawalStatements(completedWithdrawals);
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  useEffect(() => {
    if (backendUrl && getToken) {
      fetchWithdrawalHistory();
    }
  }, [backendUrl, getToken]);

  // Auto-refresh withdrawal history every 30 seconds to catch status updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (backendUrl && getToken) {
        fetchWithdrawalHistory();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [backendUrl, getToken]);

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate amount
      if (!amount || parseFloat(amount) < minWithdrawal) {
        toast.error(`Minimum withdrawal amount is ${safeCurrency}${minWithdrawal}`);
        return;
      }

      if (parseFloat(amount) > availableBalance) {
        toast.error('Insufficient balance');
        return;
      }

      // Validate details based on method
      if (withdrawalMethod === 'bank') {
        if (!bankDetails.accountNumber || !bankDetails.accountHolderName) {
          toast.error('Please fill all bank details');
          return;
        }
      } else {
        if (!mobileDetails.phoneNumber || !mobileDetails.accountHolderName) {
          toast.error('Please enter phone number and account holder name');
          return;
        }
      }

      // Get auth token
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      // Prepare withdrawal data based on method - FIXED DATA STRUCTURE
      const withdrawalData = {
        amount: parseFloat(amount),
        method: withdrawalMethod === 'bank' ? 'bank_transfer' : 'mobile_banking'
      };

      if (withdrawalMethod === 'bank') {
        // Ensure all required bank fields are present
        if (!bankDetails.bankName) {
          toast.error('Please enter bank name');
          return;
        }

        withdrawalData.bankTransferDetails = {
          accountName: bankDetails.accountHolderName.trim(),
          bankName: bankDetails.bankName.trim(),
          accountNumber: bankDetails.accountNumber.trim()
        };
      } else {
        // Ensure all required mobile banking fields are present
        if (!mobileDetails.paymentMethod) {
          toast.error('Please select payment method');
          return;
        }

        // Map frontend provider names to backend enum values
        const providerMapping = {
          'khalti': 'Khalti',
          'esewa': 'eSewa',
          'ime': 'IME Pay',
          'connectips': 'ConnectIPS'
        };

        withdrawalData.mobileBankingDetails = {
          accountHolderName: mobileDetails.accountHolderName.trim(),
          mobileNumber: mobileDetails.phoneNumber.trim(),
          provider: providerMapping[mobileDetails.paymentMethod] || 'Other'
        };
      }

      // Call the withdrawal API
      const response = await axios.post(
        `${backendUrl}/api/withdrawals/request`,
        withdrawalData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Withdrawal request submitted successfully!');
        setAmount('');

        // Reset form fields
        setBankDetails({
          accountNumber: '',
          accountHolderName: '',
          bankName: ''
        });
        setMobileDetails({
          phoneNumber: '',
          paymentMethod: 'khalti',
          accountHolderName: ''
        });

        // Refresh withdrawal history
        fetchWithdrawalHistory();

        // Switch to pending requests tab to show the new request
        setActiveTab('history');
      } else {
        toast.error(response.data.message || 'Failed to submit withdrawal request');
      }

    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process withdrawal. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    // FIXED: Use exact backend status values
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    // FIXED: Use exact backend status values
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 card-hover">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Withdrawal Center</h1>
              <p className="text-gray-600 text-sm sm:text-base">Withdraw your earnings securely and instantly</p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200 shadow-sm">
              <div className="text-center lg:text-right">
                <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Available Balance</div>
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-700">
                  <AnimatedNumber
                    value={availableBalance}
                    currency={safeCurrency}
                    duration={2000}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Mobile Tab Navigation */}
          <div className="sm:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full p-4 text-center font-medium bg-white border-b border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="withdraw">Make Withdrawal</option>
              <option value="history">Pending Requests</option>
              <option value="statements">Statements</option>
            </select>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden sm:flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 text-center font-medium transition-all duration-300 relative group ${activeTab === 'withdraw'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <FaMoneyBillWave className={`inline mr-2 transition-transform duration-200 ${activeTab === 'withdraw' ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-sm sm:text-base">Make Withdrawal</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 text-center font-medium transition-all duration-300 relative group ${activeTab === 'history'
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-600 border-b-2 border-yellow-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <FaHistory className={`inline mr-2 transition-transform duration-200 ${activeTab === 'history' ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-sm sm:text-base">Pending Requests</span>
            </button>
            <button
              onClick={() => setActiveTab('statements')}
              className={`flex-1 px-3 sm:px-4 py-3 sm:py-4 text-center font-medium transition-all duration-300 relative group ${activeTab === 'statements'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              <FaFileInvoice className={`inline mr-2 transition-transform duration-200 ${activeTab === 'statements' ? 'scale-110' : 'group-hover:scale-105'}`} />
              <span className="text-sm sm:text-base">Statements</span>
            </button>
          </div>

          {/* Refresh Button */}
          <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 flex justify-between items-center">
            <div className="text-xs sm:text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
            <button
              onClick={() => {
                fetchWithdrawalHistory();
                toast.success('Withdrawal history refreshed!');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-blue-100 transition-all duration-200 active:scale-95"
            >
              <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Withdrawal Form */}
          {activeTab === 'withdraw' && (
            <div className="p-3 sm:p-6">
              <form onSubmit={handleWithdrawal} className="space-y-4 sm:space-y-6">

                {/* Amount Input */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
                  <label className="block text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Enter amount (Min: ${safeCurrency}${minWithdrawal})`}
                      className="w-full px-4 py-3 sm:py-4 text-lg sm:text-xl border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                      min={minWithdrawal}
                      max={availableBalance}
                    />
                    <div className="absolute right-4 top-3 sm:top-4 text-lg sm:text-xl font-semibold text-blue-600">
                      {safeCurrency}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium text-center">
                      Min: {safeCurrency}{minWithdrawal}
                    </span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium text-center">
                      Available: {safeCurrency}{availableBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Withdrawal Method */}
                <div>
                  <label className="block text-sm sm:text-base font-medium text-gray-700 mb-3">
                    Choose Withdrawal Method
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setWithdrawalMethod('bank')}
                      className={`p-4 sm:p-6 border-2 rounded-xl transition-all duration-300 group ${withdrawalMethod === 'bank'
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
                        }`}
                    >
                      <FaUniversity className={`text-2xl sm:text-3xl mb-2 mx-auto transition-all duration-200 ${withdrawalMethod === 'bank' ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                        }`} />
                      <div className="font-medium text-sm sm:text-base">Bank Transfer</div>
                      <div className="text-xs sm:text-sm text-gray-500">2-3 business days</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawalMethod('mobile')}
                      className={`p-4 sm:p-6 border-2 rounded-xl transition-all duration-300 group ${withdrawalMethod === 'mobile'
                        ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md hover:scale-102'
                        }`}
                    >
                      <FaMobile className={`text-2xl sm:text-3xl mb-2 mx-auto transition-all duration-200 ${withdrawalMethod === 'mobile' ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'
                        }`} />
                      <div className="font-medium text-sm sm:text-base">Mobile Wallet</div>
                      <div className="text-xs sm:text-sm text-gray-500">Khalti, eSewa - Instant</div>
                    </button>
                  </div>
                </div>

                {/* Bank Details */}
                {withdrawalMethod === 'bank' && (
                  <div className="space-y-4 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm animate-slide-in">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <FaUniversity className="mr-2 text-blue-600" />
                      Bank Account Details
                    </h4>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.accountHolderName}
                          onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="Enter full name as per bank account"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="e.g., Nepal Investment Bank"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number
                        </label>
                        <div className="relative">
                          <input
                            type={showAccountNumber ? "text" : "password"}
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                            placeholder="Enter account number"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAccountNumber(!showAccountNumber)}
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                          >
                            {showAccountNumber ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Details */}
                {withdrawalMethod === 'mobile' && (
                  <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200 shadow-sm animate-slide-in">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <FaMobile className="mr-2 text-green-600" />
                      Mobile Wallet Details
                    </h4>

                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose Payment Method
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                          type="button"
                          onClick={() => setMobileDetails({ ...mobileDetails, paymentMethod: 'khalti' })}
                          className={`p-4 sm:p-6 border-2 rounded-xl transition-all duration-300 group ${mobileDetails.paymentMethod === 'khalti'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md hover:scale-102'
                            }`}
                        >
                          <div className="flex items-center justify-center mb-3">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all duration-200 ${mobileDetails.paymentMethod === 'khalti' ? 'bg-purple-100' : 'bg-gray-100 group-hover:bg-purple-100'
                              }`}>
                              <span className={`font-bold text-lg sm:text-xl transition-colors duration-200 ${mobileDetails.paymentMethod === 'khalti' ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-600'
                                }`}>K</span>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">Khalti</div>
                          <div className="text-xs sm:text-sm text-gray-500">Digital wallet</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMobileDetails({ ...mobileDetails, paymentMethod: 'esewa' })}
                          className={`p-4 sm:p-6 border-2 rounded-xl transition-all duration-300 group ${mobileDetails.paymentMethod === 'esewa'
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-green-300 hover:shadow-md hover:scale-102'
                            }`}
                        >
                          <div className="flex items-center justify-center mb-3">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center transition-all duration-200 ${mobileDetails.paymentMethod === 'esewa' ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-green-100'
                              }`}>
                              <span className={`font-bold text-lg sm:text-xl transition-colors duration-200 ${mobileDetails.paymentMethod === 'esewa' ? 'text-green-600' : 'text-gray-400 group-hover:text-green-600'
                                }`}>E</span>
                            </div>
                          </div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">eSewa</div>
                          <div className="text-xs sm:text-sm text-gray-500">Digital wallet</div>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Account Holder Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Holder Name
                        </label>
                        <input
                          type="text"
                          value={mobileDetails.accountHolderName || ''}
                          onChange={(e) => setMobileDetails({ ...mobileDetails, accountHolderName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder="Enter account holder name"
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={mobileDetails.phoneNumber}
                          onChange={(e) => setMobileDetails({ ...mobileDetails, phoneNumber: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm"
                          placeholder={`Enter ${mobileDetails.paymentMethod === 'khalti' ? 'Khalti' : 'eSewa'} registered number`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <FaInfoCircle className="text-blue-500 mt-1 text-lg flex-shrink-0" />
                    <div className="text-sm sm:text-base text-blue-700">
                      <p className="font-semibold mb-3 text-blue-800">Important Information:</p>
                      <ul className="space-y-2 text-blue-600">
                        <li className="flex items-start">
                          <span>• Bank transfers take 2-3 business days to process</span>
                        </li>
                        <li className="flex items-start">
                          <span>• Khalti and eSewa transfers are usually instant</span>
                        </li>
                        <li className="flex items-start">
                          <span>• Use your registered phone number for mobile wallets</span>
                        </li>
                        <li className="flex items-start">
                          <span>• Minimum withdrawal amount is {safeCurrency}{minWithdrawal}</span>
                        </li>
                        <li className="flex items-start">
                          <span>• Processing fees may apply based on withdrawal method</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !amount || parseFloat(amount) < minWithdrawal}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl active:scale-95 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Withdrawal Request</span>
                      <FaArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Pending Withdrawal Requests */}
          {activeTab === 'history' && (
            <div className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {withdrawalHistory.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                      <FaClock className="text-3xl sm:text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                    <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">You don't have any pending withdrawal requests. Submit a new request to get started!</p>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Make Withdrawal
                    </button>
                  </div>
                ) : (
                  withdrawalHistory.map((withdrawal) => (
                    <div key={withdrawal._id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 card-hover">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="text-2xl sm:text-3xl flex-shrink-0 mt-1">
                            {getStatusIcon(withdrawal.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-gray-900 text-lg sm:text-xl mb-1">
                              {safeCurrency}{withdrawal.amount.toLocaleString()}
                            </div>
                            <div className="text-sm sm:text-base text-gray-600 mb-2">
                              {withdrawal.method === 'bank_transfer' ? 'Bank Transfer' : 'Mobile Wallet'}
                              {withdrawal.bankTransferDetails?.accountNumber && ` • ****${withdrawal.bankTransferDetails.accountNumber.slice(-4)}`}
                              {withdrawal.mobileBankingDetails?.mobileNumber && ` • ****${withdrawal.mobileBankingDetails.mobileNumber.slice(-4)}`}
                              {withdrawal.mobileBankingDetails?.provider && ` (${withdrawal.mobileBankingDetails.provider})`}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-400 mb-2">
                              {withdrawal.transactionReference && `Ref: ${withdrawal.transactionReference}`}
                              {!withdrawal.transactionReference && `ID: ${withdrawal._id.slice(-8)}`}
                            </div>
                            {withdrawal.rejectionReason && (
                              <div className="text-xs sm:text-sm text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                                Reason: {withdrawal.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end space-y-2 flex-shrink-0">
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(withdrawal.status)} text-center`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                            {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Withdrawal Statements */}
          {activeTab === 'statements' && (
            <div className="p-3 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {withdrawalStatements.length === 0 ? (
                  <div className="text-center py-12 sm:py-16">
                    <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
                      <FaReceipt className="text-3xl sm:text-4xl text-gray-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Withdrawal Statements</h3>
                    <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">Your completed withdrawals will appear here once processed successfully.</p>
                    <button
                      onClick={() => setActiveTab('withdraw')}
                      className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      Make First Withdrawal
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {withdrawalStatements.map((withdrawal) => (
                      <div key={withdrawal._id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 card-hover">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaCheckCircle className="text-green-600 text-lg sm:text-xl" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-green-800 text-sm sm:text-base">Withdrawal Completed</h3>
                              <p className="text-xs sm:text-sm text-green-600">Successfully processed</p>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium self-start sm:self-center">
                            PAID
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="bg-white rounded-lg p-4 mb-4 border border-green-200 shadow-sm">
                          <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-green-700 mb-1">
                              {safeCurrency}{withdrawal.amount.toLocaleString()}
                            </div>
                            <div className="text-xs sm:text-sm text-green-600">Amount Withdrawn</div>
                          </div>
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center justify-between py-2 border-b border-green-100">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Method:</span>
                            <span className="text-xs sm:text-sm text-gray-900 flex items-center">
                              {withdrawal.method === 'bank_transfer' ? (
                                <>
                                  <FaUniversity className="mr-1 text-blue-600" />
                                  Bank Transfer
                                </>
                              ) : (
                                <>
                                  <FaMobile className="mr-1 text-green-600" />
                                  Mobile Wallet
                                </>
                              )}
                            </span>
                          </div>

                          {withdrawal.bankTransferDetails?.accountNumber && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Account:</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-mono">****{withdrawal.bankTransferDetails.accountNumber.slice(-4)}</span>
                            </div>
                          )}

                          {withdrawal.mobileBankingDetails?.mobileNumber && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Phone:</span>
                              <span className="text-xs sm:text-sm text-gray-900 font-mono">****{withdrawal.mobileBankingDetails.mobileNumber.slice(-4)}</span>
                            </div>
                          )}

                          {withdrawal.mobileBankingDetails?.provider && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Provider:</span>
                              <span className="text-xs sm:text-sm text-gray-900">{withdrawal.mobileBankingDetails.provider}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between py-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Date:</span>
                            <span className="text-xs sm:text-sm text-gray-900 flex items-center">
                              <FaCalendarAlt className="mr-1 text-gray-500" />
                              {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>

                          {withdrawal.transactionReference && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-1 gap-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Reference:</span>
                              <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded break-all">
                                {withdrawal.transactionReference}
                              </span>
                            </div>
                          )}

                          {!withdrawal.transactionReference && (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">ID:</span>
                              <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                {withdrawal._id.slice(-8)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3 border-t border-green-200">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-600">
                            <span className="flex items-center">
                              <FaCheckCircle className="mr-1" />
                              Verified Transaction
                            </span>
                            <span className="flex items-center">
                              <FaArrowRight className="mr-1" />
                              Funds Transferred
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;