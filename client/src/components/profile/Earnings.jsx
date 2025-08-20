import React from 'react';
import AnimatedNumber from '../common/AnimatedNumber';
import {
  FaDollarSign,
  FaChartLine,
  FaWallet,
  FaPiggyBank,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaArrowUp,
  FaCoins,
  FaGift,
  FaStar
} from 'react-icons/fa';

const Earnings = ({ earningsData, currency, referralData }) => {
  // Add safety checks and default values to prevent crashes
  const safeEarningsData = earningsData || {};
  const safeReferralData = referralData || [];
  const safeCurrency = currency || 'Rs ';

  // Calculate percentage changes for trend indicators with safety checks
  const todayPercentage = safeEarningsData.today > 0 ? ((safeEarningsData.today / 20000) * 100) : 0;
  const weeklyPercentage = safeEarningsData.lastSevenDays > 0 ? ((safeEarningsData.lastSevenDays / 140000) * 100) : 0;
  
  // Early return if no data is available
  if (!earningsData && !referralData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaChartLine className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Earnings Data Available</h2>
          <p className="text-gray-600">Please wait while we load your earnings information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Earnings Overview</h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Track your earnings, monitor your progress, and manage your financial growth
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    <AnimatedNumber 
                      value={safeEarningsData.lifetime || 0} 
                      currency={safeCurrency}
                      duration={2500}
                      delay={200}
                    />
                  </div>
                  <div className="text-sm text-green-700 font-medium">Total Lifetime</div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    <AnimatedNumber 
                      value={safeEarningsData.availableBalance || 0} 
                      currency={safeCurrency}
                      duration={2300}
                      delay={400}
                    />
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Available Now</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Last updated: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Earnings Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 mb-8">
        {/* Left Column - Detailed Earnings */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
          {/* Today's Performance */}
          <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Today's Performance</h3>
                <p className="text-gray-600">Daily earning target: Rs 20,000</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaChartLine className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-4xl font-bold text-green-600">
                  <AnimatedNumber 
                    value={safeEarningsData.today || 0} 
                    currency={safeCurrency}
                    duration={2000}
                    delay={300}
                  />
                </span>
                <span className="text-xl text-gray-500">Rs 20,000/-</span>
              </div>
              
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-600 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${Math.min(todayPercentage, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                
                <div className="absolute -top-8 right-0 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {Math.round(todayPercentage)}% Complete
                </div>
              </div>

              {/* Performance indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="text-lg font-semibold text-green-700">{Math.round(todayPercentage)}%</div>
                  <div className="text-sm text-green-600">Goal Progress</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="text-lg font-semibold text-blue-700">{safeEarningsData.today > 0 ? 'On Track' : 'Get Started'}</div>
                  <div className="text-sm text-blue-600">Status</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="text-lg font-semibold text-purple-700">{safeEarningsData.today > 0 ? 'Active' : 'Pending'}</div>
                  <div className="text-sm text-purple-600">Activity</div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly & Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weekly Performance */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Weekly Performance</h4>
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaCalendarAlt className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-3">
                <AnimatedNumber 
                  value={safeEarningsData.lastSevenDays || 0} 
                  currency={safeCurrency}
                  duration={2200}
                  delay={500}
                />
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-3">
                <div className="bg-blue-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Target: Rs 140,000</span>
                <span>{Math.round(weeklyPercentage)}%</span>
              </div>
            </div>

            {/* Monthly Performance */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-200 hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold text-gray-900">Monthly Performance</h4>
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FaChartLine className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-3">
                <AnimatedNumber 
                  value={safeEarningsData.thisMonth || 0} 
                  currency={safeCurrency}
                  duration={2400}
                  delay={600}
                />
              </div>
              <div className="w-full bg-purple-200 rounded-full h-3 mb-3">
                <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: '15%' }}></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Target: Rs 600,000</span>
                <span>15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats & Actions */}
        <div className="space-y-6 lg:space-y-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-700">Total Withdrawn</div>
                    <div className="text-sm text-green-600">Successfully processed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    <AnimatedNumber 
                      value={safeEarningsData.totalWithdrawn || 0} 
                      currency={safeCurrency}
                      duration={1500}
                      delay={700}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                    <FaClock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-orange-700">Pending Withdrawals</div>
                    <div className="text-sm text-orange-600">Awaiting processing</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-orange-600">
                    <AnimatedNumber 
                      value={safeEarningsData.pendingWithdrawals || 0} 
                      currency={safeCurrency}
                      duration={1800}
                      delay={800}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <FaGift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-700">Referral Bonus</div>
                    <div className="text-sm text-blue-600">From referrals</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    <AnimatedNumber 
                      value={(safeReferralData.length || 0) * 1000} 
                      currency={safeCurrency}
                      duration={2000}
                      delay={900}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Badge */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-6 border border-yellow-200 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaStar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Earnings Achievement</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {(safeEarningsData.lifetime || 0) > 100000 ? 
                  "Congratulations! You've reached the Gold tier!" :
                  (safeEarningsData.lifetime || 0) > 50000 ?
                  "Great progress! You're on your way to Gold tier!" :
                  "Keep going! Every referral brings you closer to your goals!"
                }
              </p>
              <div className="bg-white/50 rounded-2xl p-3">
                <div className="text-2xl font-bold text-amber-600">
                  {(safeEarningsData.lifetime || 0) > 100000 ? '🥇 Gold' : 
                   (safeEarningsData.lifetime || 0) > 50000 ? '🥈 Silver' : '🥉 Bronze'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Balance Breakdown */}
      {(safeEarningsData.withdrawableBalance || safeEarningsData.totalWithdrawn || safeEarningsData.pendingWithdrawals) && (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Withdrawal Balance Breakdown</h3>
            <p className="text-gray-600">Understand how your earnings are distributed</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaWallet className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                <AnimatedNumber 
                  value={safeEarningsData.withdrawableBalance || 0} 
                  currency={safeCurrency}
                  duration={2000}
                  delay={1000}
                />
              </div>
              <div className="text-lg font-semibold text-green-700 mb-1">Total Withdrawable</div>
              <div className="text-sm text-green-600">50% of affiliate earnings</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                <AnimatedNumber 
                  value={safeEarningsData.totalWithdrawn || 0} 
                  currency={safeCurrency}
                  duration={2000}
                  delay={1200}
                />
              </div>
              <div className="text-lg font-semibold text-blue-700 mb-1">Already Withdrawn</div>
              <div className="text-sm text-blue-600">Successfully processed</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl border border-orange-200 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaPiggyBank className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                <AnimatedNumber 
                  value={safeEarningsData.availableBalance || 0} 
                  currency={safeCurrency}
                  duration={2000}
                  delay={1400}
                />
              </div>
              <div className="text-lg font-semibold text-orange-700 mb-1">Available Now</div>
              <div className="text-sm text-orange-600">Ready for withdrawal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
