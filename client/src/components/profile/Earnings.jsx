import React from 'react';
import AnimatedNumber from '../common/AnimatedNumber';

const Earnings = ({ earningsData, currency, referralData }) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Earnings Overview</h2>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Detailed Earnings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Lifetime Earnings</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            <AnimatedNumber 
              value={earningsData.lifetime} 
              currency={currency}
              duration={2500}
              delay={200}
            />
          </p>
          <p className="text-green-100 text-xs sm:text-sm mt-2">Total earnings from all referrals</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Withdrawable Balance</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            <AnimatedNumber 
              value={earningsData.availableBalance || 0} 
              currency={currency}
              duration={2300}
              delay={400}
            />
          </p>
          <p className="text-blue-100 text-xs sm:text-sm mt-2">Available for withdrawal</p>
        </div>
      </div>

      {/* Additional Earnings Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-lg sm:text-xl font-bold text-green-600">
            <AnimatedNumber 
              value={earningsData.today} 
              currency={currency}
              duration={2000}
              delay={600}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Today</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            <AnimatedNumber 
              value={earningsData.lastSevenDays} 
              currency={currency}
              duration={2200}
              delay={800}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Last 7 Days</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-lg sm:text-xl font-bold text-blue-600">
            <AnimatedNumber 
              value={earningsData.totalWithdrawn || 0} 
              currency={currency}
              duration={1500}
              delay={1000}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Withdrawn</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-lg sm:text-xl font-bold text-orange-600">
            <AnimatedNumber 
              value={earningsData.pendingWithdrawals || 0} 
              currency={currency}
              duration={1800}
              delay={1200}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Withdrawal Balance Breakdown */}
      {(earningsData.withdrawableBalance || earningsData.totalWithdrawn || earningsData.pendingWithdrawals) && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdrawal Balance Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <AnimatedNumber 
                  value={earningsData.withdrawableBalance || 0} 
                  currency={currency}
                  duration={2000}
                  delay={1400}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Withdrawable</div>
              <div className="text-xs text-gray-500">50% of affiliate earnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                <AnimatedNumber 
                  value={earningsData.totalWithdrawn || 0} 
                  currency={currency}
                  duration={2000}
                  delay={1600}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">Already Withdrawn</div>
              <div className="text-xs text-gray-500">Successfully processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                <AnimatedNumber 
                  value={earningsData.availableBalance || 0} 
                  currency={currency}
                  duration={2000}
                  delay={1800}
                />
              </div>
              <div className="text-sm text-gray-600 mt-1">Available Now</div>
              <div className="text-xs text-gray-500">Ready for withdrawal</div>
            </div>
          </div>
        </div>
      )}

    
    </div>
  );
};

export default Earnings;
