import React from 'react';
import AnimatedNumber from '../common/AnimatedNumber';
import {
  FaCrown,
  FaGraduationCap,
  FaGem,
  FaChartLine,
  FaChartBar,
  FaCalendarAlt,
  FaBook,
  FaUsers,
  FaTrophy,
  FaBolt,
  FaDollarSign,
  FaEdit
} from 'react-icons/fa';

const Dashboard = ({
  userData,
  earningsData,
  currency,
  affiliateCode,
  affiliateLink,
  copyToClipboard,
  purchasedCourses,
  referralData,
  leaderboard,
  navigate,
  setActiveTab
}) => {
  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

  return (
    <div className="space-y-6">
      {/* Profile Section - Always Visible */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl flex items-center space-x-4">
        <div className="relative">
          <img
            src={userData.imageUrl || '/default-avatar.png'}
            alt="Profile"
            className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
          />
          {/* KYC Verified Badge on Profile Picture */}
          {userData.kycStatus === 'verified' && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate flex items-center">
            {fullName || 'Welcome!'}
            {/* KYC Verified Badge next to name */}
            {userData.kycStatus === 'verified' && (
              <svg
                className="w-5 h-5 text-rose-200 ml-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </h1>
          {/* Show latest course name for students */}
          {!userData.isAdmin ? (
            <p className="text-rose-100 truncate">
              {purchasedCourses.length > 0 
                ? `Latest: ${purchasedCourses[0].courseTitle || 'Recent Course'}`
                : 'No courses enrolled yet'
              }
            </p>
          ) : (
            <p className="text-rose-100 truncate">Administrator</p>
          )}
          <div className="flex items-center mt-2 space-x-2">
            {userData.isAdmin ? (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <FaCrown /> <span>Admin</span>
              </span>
            ) : (
              purchasedCourses.length > 0 && (
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <FaBook /> 
                  <span>
                    {purchasedCourses.length} Course{purchasedCourses.length !== 1 ? 's' : ''}
                  </span>
                </span>
              )
            )}
            {/* KYC Status Badge */}
            {userData.kycStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                userData.kycStatus === 'verified' 
                  ? 'bg-green-500/20 text-green-100' 
                  : userData.kycStatus === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-100'
                  : userData.kycStatus === 'rejected'
                  ? 'bg-red-500/20 text-red-100'
                  : 'bg-gray-500/20 text-gray-100'
              }`}>
                <span>KYC: {userData.kycStatus.charAt(0).toUpperCase() + userData.kycStatus.slice(1)}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Consolidated Earnings & Balance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Earnings Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Earnings Overview</h3>
              <p className="text-green-100 text-sm">Your complete financial summary</p>
            </div>
            <div className="text-3xl opacity-80">
              <FaGem />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-green-100 text-xs font-medium mb-1">Lifetime Earnings</p>
              <p className="text-xl sm:text-2xl font-bold">
                <AnimatedNumber value={earningsData.lifetime || 0} currency={currency} duration={2500} delay={200} />
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-100 text-xs font-medium mb-1">Today</p>
              <p className="text-xl sm:text-2xl font-bold">
                <AnimatedNumber value={earningsData.today || 0} currency={currency} duration={2000} delay={400} />
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-100 text-xs font-medium mb-1">7 Days</p>
              <p className="text-xl sm:text-2xl font-bold">
                <AnimatedNumber value={earningsData.lastSevenDays || 0} currency={currency} duration={2200} delay={600} />
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-100 text-xs font-medium mb-1">This Month</p>
              <p className="text-xl sm:text-2xl font-bold">
                <AnimatedNumber value={earningsData.thisMonth || 0} currency={currency} duration={2300} delay={800} />
              </p>
            </div>
          </div>

          {/* Current Balance Section */}
          <div className="mt-6 pt-6 border-t border-green-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Current Balance (Withdrawable)</p>
                <p className="text-3xl font-bold mt-1">
                  <AnimatedNumber 
                    value={earningsData.availableBalance || 0} 
                    currency={currency} 
                    duration={2000} 
                    delay={1000} 
                  />
                </p>
                {earningsData.pendingWithdrawals > 0 && (
                  <p className="text-green-200 text-xs mt-1">
                    {currency}{earningsData.pendingWithdrawals} pending withdrawal
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-green-100 space-y-1">
                <div>Total Withdrawable: {currency}{earningsData.withdrawableBalance || 0}</div>
                <div>Total Withdrawn: {currency}{earningsData.totalWithdrawn || 0}</div>
                <div>Pending: {currency}{earningsData.pendingWithdrawals || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Request Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Withdrawal</h3>
              <p className="text-gray-600 text-sm">Request money withdrawal</p>
            </div>
            <div className="text-2xl text-green-600">
              <FaDollarSign />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('withdrawal-request')}
              disabled={!earningsData.availableBalance || earningsData.availableBalance <= 0}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Mobile Banking</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawal-request')}
              disabled={!earningsData.availableBalance || earningsData.availableBalance <= 0}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Bank Transfer</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawal-history')}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">Withdrawal History</span>
            </button>

            {(!earningsData.availableBalance || earningsData.availableBalance <= 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span className="text-xs text-yellow-800">
                    No balance available for withdrawal
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Activity Overview</h3>
              <p className="text-gray-600 text-sm">Your learning and earning progress</p>
            </div>
            <div className="text-3xl">
              <FaChartBar />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-3xl mb-2">
                <FaBook />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                <AnimatedNumber value={purchasedCourses.length} decimals={0} duration={1500} delay={1000} />
              </div>
              <div className="text-sm text-blue-700 font-medium">Courses Enrolled</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-3xl mb-2">
                <FaUsers />
              </div>
              <div className="text-2xl font-bold text-green-600">
                <AnimatedNumber value={referralData.length} decimals={0} duration={1500} delay={1200} />
              </div>
              <div className="text-sm text-green-700 font-medium">People Referred</div>
            </div>

            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="text-3xl mb-2">
                <FaTrophy />
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {leaderboard.findIndex(user => user._id === userData._id) + 1 ? (
                  <>
                    #
                    <AnimatedNumber
                      value={leaderboard.findIndex(user => user._id === userData._id) + 1}
                      decimals={0}
                      duration={1500}
                      delay={1400}
                    />
                  </>
                ) : (
                  '#N/A'
                )}
              </div>
              <div className="text-sm text-yellow-700 font-medium">Leaderboard Rank</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600 text-sm">Common tasks</p>
            </div>
            <div className="text-2xl">
              <FaBolt />
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/courses')}
              className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
            >
              <FaGraduationCap className="text-xl" />
              <span className="font-medium">Browse Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
            >
              <FaUsers className="text-xl" />
              <span className="font-medium">View Referrals</span>
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              <FaEdit className="text-xl" />
              <span className="font-medium">Edit Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
