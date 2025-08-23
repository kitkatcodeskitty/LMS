import React, { useState, useContext } from 'react';
import WithdrawalRequest from './WithdrawalRequest';
import WithdrawalHistory from './WithdrawalHistory';
import AnimatedNumber from '../common/AnimatedNumber';
import { AppContext } from '../../context/AppContext';
import {
  FaWallet,
  FaClock,
  FaMoneyBillWave,
  FaHeadset,
  FaHistory,
  FaPlus
} from 'react-icons/fa';

const Withdrawal = () => {
  const [activeSection, setActiveSection] = useState('request'); // 'request' or 'history'
  const { userData, currency } = useContext(AppContext);

  // Show loading state while fetching user data
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3"></div>
              <h1 className="text-xl font-bold">Loading Withdrawal Center...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Withdrawal Center</h1>
              <p className="text-white/90">Manage your earnings and track withdrawal history</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-xs text-white/80 mb-1">Available Balance</div>
                <div className="text-xl font-bold">
                  <AnimatedNumber 
                    value={userData.withdrawableBalance || 0} 
                    currency={currency || 'Rs'} 
                    duration={2000} 
                    delay={100} 
                  />
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-xs text-white/80 mb-1">Pending</div>
                <div className="text-xl font-bold">
                  <AnimatedNumber 
                    value={userData.pendingWithdrawals || 0} 
                    currency={currency || 'Rs'} 
                    duration={1800} 
                    delay={200} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex bg-gradient-to-r from-gray-50 to-rose-50 p-1">
            <button
              onClick={() => setActiveSection('request')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeSection === 'request'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaPlus className="w-4 h-4" />
                <span>New Withdrawal</span>
              </div>
            </button>
            <button
              onClick={() => setActiveSection('history')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeSection === 'history'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FaHistory className="w-4 h-4" />
                <span>History</span>
              </div>
            </button>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {activeSection === 'request' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaPlus className="w-5 h-5 text-rose-500 mr-2" />
                    Request New Withdrawal
                  </h2>
                  <p className="text-gray-600">Choose your preferred withdrawal method and enter the required details</p>
                </div>
                
                <WithdrawalRequest
                  inline={true}
                  onClose={() => setActiveSection('history')}
                  onSuccess={() => {
                    setActiveSection('history');
                  }}
                />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <FaHistory className="w-5 h-5 text-purple-500 mr-2" />
                    Withdrawal History
                  </h2>
                  <p className="text-gray-600">Track all your withdrawal requests and their current status</p>
                </div>
                
                <WithdrawalHistory />
              </div>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Processing Time */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <FaClock className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Processing Time</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/80">Bank Transfer:</span>
                <span className="font-medium">2-3 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/80">Mobile Wallet:</span>
                <span className="font-medium">Instant</span>
              </div>
            </div>
          </div>

          {/* Minimum Amount */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <FaMoneyBillWave className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Minimum Amount</h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                <AnimatedNumber 
                  value={500} 
                  currency={currency || 'Rs'} 
                  duration={1500} 
                  delay={300} 
                />
              </div>
              <div className="text-white/80 text-xs">Required for withdrawal</div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center mb-3">
              <div className="bg-white/20 rounded-lg p-2 mr-3">
                <FaHeadset className="w-4 h-4" />
              </div>
              <h3 className="font-semibold">Need Help?</h3>
            </div>
            <div className="text-center">
              <div className="text-white/80 text-xs mb-3">Contact support for assistance</div>
              <button className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                Get Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawal;