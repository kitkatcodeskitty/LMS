import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from '../common/Button';
import Modal from '../common/Modal';
import MobileBankingForm from './MobileBankingForm';
import BankTransferForm from './BankTransferForm';
import AnimatedNumber from '../common/AnimatedNumber';

const WithdrawalRequest = ({ isOpen = true, onClose, onSuccess, inline = false }) => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingBalance, setFetchingBalance] = useState(true);

  // Fetch available balance when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAvailableBalance();
      setSelectedMethod(''); // Reset method selection
    }
  }, [isOpen]);

  const fetchAvailableBalance = async () => {
    setFetchingBalance(true);
    try {
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/withdrawals/available-balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setBalanceData(data.data);
        setAvailableBalance(data.data.availableBalance);
      } else {
        toast.error('Failed to fetch balance information');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to fetch balance');
    } finally {
      setFetchingBalance(false);
    }
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod('');
  };

  const handleWithdrawalSuccess = () => {
    setSelectedMethod('');
    onSuccess?.();
    onClose();
    toast.success('Withdrawal request submitted successfully!');
  };

  const renderMethodSelection = () => (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Balance</h3>
          {fetchingBalance ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mx-auto"></div>
            </div>
          ) : (
            <div className="text-3xl font-bold text-green-600">
              <AnimatedNumber 
                value={availableBalance} 
                currency={currency}
                duration={1500}
              />
            </div>
          )}
          {balanceData && !fetchingBalance && (
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="block font-medium">Withdrawable</span>
                <span className="text-gray-800">{currency}{balanceData.withdrawableBalance}</span>
              </div>
              <div>
                <span className="block font-medium">Pending</span>
                <span className="text-orange-600">{currency}{balanceData.pendingWithdrawals}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Method Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Select Withdrawal Method</h3>
        
        {/* Mobile Banking Option */}
        <button
          onClick={() => handleMethodSelect('mobile_banking')}
          disabled={availableBalance <= 0}
          className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Mobile Banking</h4>
              <p className="text-sm text-gray-600">eSewa, Khalti, IME Pay, ConnectIPS</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Bank Transfer Option */}
        <button
          onClick={() => handleMethodSelect('bank_transfer')}
          disabled={availableBalance <= 0}
          className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">Bank Transfer</h4>
              <p className="text-sm text-gray-600">Direct bank account transfer</p>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {availableBalance <= 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              You don't have sufficient balance to make a withdrawal.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderForm = () => {
    if (selectedMethod === 'mobile_banking') {
      return (
        <MobileBankingForm
          availableBalance={availableBalance}
          onBack={handleBack}
          onSuccess={handleWithdrawalSuccess}
          loading={loading}
          setLoading={setLoading}
        />
      );
    } else if (selectedMethod === 'bank_transfer') {
      return (
        <BankTransferForm
          availableBalance={availableBalance}
          onBack={handleBack}
          onSuccess={handleWithdrawalSuccess}
          loading={loading}
          setLoading={setLoading}
        />
      );
    }
    return null;
  };

  if (inline) {
    return (
      <div className="space-y-6">
        {selectedMethod ? renderForm() : renderMethodSelection()}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedMethod ? 'Withdrawal Request' : 'Request Withdrawal'}
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      {selectedMethod ? renderForm() : renderMethodSelection()}
    </Modal>
  );
};

export default WithdrawalRequest;