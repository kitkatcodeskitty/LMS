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
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">This Month</h3>
          <p className="text-2xl sm:text-3xl font-bold">
            <AnimatedNumber 
              value={earningsData.thisMonth} 
              currency={currency}
              duration={2300}
              delay={400}
            />
          </p>
          <p className="text-blue-100 text-xs sm:text-sm mt-2">Earnings in current month</p>
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
          <div className="text-lg sm:text-xl font-bold text-orange-600">
            <AnimatedNumber 
              value={referralData.length} 
              decimals={0}
              duration={1500}
              delay={1000}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Referrals</div>
        </div>
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 text-center">
          <div className="text-lg sm:text-xl font-bold text-blue-600">
            <AnimatedNumber 
              value={earningsData.lifetime / Math.max(referralData.length, 1)} 
              currency={currency}
              duration={1800}
              delay={1200}
            />
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Avg/Referral</div>
        </div>
      </div>

    
    </div>
  );
};

export default Earnings;
