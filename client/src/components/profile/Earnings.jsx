import React from 'react';
import AnimatedNumber from '../common/AnimatedNumber';
import {
  FaChartLine,
  FaWallet,
  FaPiggyBank,
  FaCalendarAlt,
  FaCheckCircle
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
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <FaChartLine className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Earnings Data Available</h2>
          <p className="text-gray-600">Please wait while we load your earnings information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between space-y-4 lg:space-y-0 lg:space-x-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Earnings Overview</h1>
            <p className="text-white/80">
              Track your earnings, monitor your progress, and manage your financial growth
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber
                    value={safeEarningsData.lifetime || 0}
                    currency={safeCurrency}
                    duration={2500}
                    delay={200}
                  />
                </div>
                <div className="text-xs text-white/80">Total Lifetime</div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-center">
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber
                    value={safeEarningsData.availableBalance || 0}
                    currency={safeCurrency}
                    duration={2300}
                    delay={400}
                  />
                </div>
                <div className="text-xs text-white/80">Available Now</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Performance Card */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">Today's Performance</h3>
            <p className="text-white/80 text-sm">Daily earning target: Rs 20,000</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <FaChartLine className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              <AnimatedNumber
                value={safeEarningsData.today || 0}
                currency={safeCurrency}
                duration={2000}
                delay={300}
              />
            </span>
            <span className="text-lg text-white/80">Rs 20,000/-</span>
          </div>

          <div className="relative">
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(todayPercentage, 100)}%` }}
              ></div>
            </div>

            <div className="absolute -top-8 right-0 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium">
              {Math.round(todayPercentage)}% Complete
            </div>
          </div>

          {/* Performance indicators */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <div className="text-lg font-bold">{Math.round(todayPercentage)}%</div>
              <div className="text-xs text-white/80">Goal Progress</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <div className="text-lg font-bold">{safeEarningsData.today > 0 ? 'On Track' : 'Start'}</div>
              <div className="text-xs text-white/80">Status</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <div className="text-lg font-bold">{safeEarningsData.today > 0 ? 'Active' : 'Pending'}</div>
              <div className="text-xs text-white/80">Activity</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        {/* Last Week */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">
              <FaCalendarAlt className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-white/80 font-medium">7 Days</span>
          </div>
          <div className="text-sm text-white/80 mb-1">Last Week</div>
          <div className="text-xl font-bold text-white mb-2">
            <AnimatedNumber
              value={safeEarningsData.lastSevenDays || 0}
              currency={safeCurrency}
              duration={2200}
              delay={500}
            />
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-white/70">
            <span>Target: Rs 140,000</span>
            <span>{Math.round(weeklyPercentage)}%</span>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">
              <FaChartLine className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-white/80 font-medium">30 Days</span>
          </div>
          <div className="text-sm text-white/80 mb-1">This Month</div>
          <div className="text-xl font-bold text-white mb-2">
            <AnimatedNumber
              value={safeEarningsData.thisMonth || 0}
              currency={safeCurrency}
              duration={2400}
              delay={600}
            />
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: '15%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-white/70">
            <span>Target: Rs 600,000</span>
            <span>15%</span>
          </div>
        </div>

        {/* All Time */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-white/20 rounded-lg p-2">
              <FaWallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs text-white/80 font-medium">Lifetime</span>
          </div>
          <div className="text-sm text-white/80 mb-1">All Time</div>
          <div className="text-xl font-bold text-white mb-2">
            <AnimatedNumber
              value={safeEarningsData.lifetime || 0}
              currency={safeCurrency}
              duration={2600}
              delay={700}
            />
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full transition-all duration-1000" style={{ width: '25%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-white/70">
            <span>Total Achievement</span>
            <span>Growing</span>
          </div>
        </div>
      </div>

      {/* Withdrawal Balance Breakdown */}
      {(safeEarningsData.withdrawableBalance || safeEarningsData.totalWithdrawn || safeEarningsData.pendingWithdrawals) && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="bg-rose-100 rounded-lg p-2 mr-3">
              <FaWallet className="w-5 h-5 text-rose-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Withdrawal Balance Breakdown</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <FaWallet className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-sm text-white/80 mb-1">Total Withdrawable</div>
              <div className="text-xl font-bold text-white mb-2">
                <AnimatedNumber
                  value={safeEarningsData.withdrawableBalance || 0}
                  currency={safeCurrency}
                  duration={2000}
                  delay={1000}
                />
              </div>
              <div className="text-xs text-white/70">50% of affiliate earnings</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <FaCheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-sm text-white/80 mb-1">Already Withdrawn</div>
              <div className="text-xl font-bold text-white mb-2">
                <AnimatedNumber
                  value={safeEarningsData.totalWithdrawn || 0}
                  currency={safeCurrency}
                  duration={2000}
                  delay={1200}
                />
              </div>
              <div className="text-xs text-white/70">Successfully processed</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 rounded-lg p-2">
                  <FaPiggyBank className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-sm text-white/80 mb-1">Available Now</div>
              <div className="text-xl font-bold text-white mb-2">
                <AnimatedNumber
                  value={safeEarningsData.availableBalance || 0}
                  currency={safeCurrency}
                  duration={2000}
                  delay={1400}
                />
              </div>
              <div className="text-xs text-white/70">Ready for withdrawal</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earnings;
