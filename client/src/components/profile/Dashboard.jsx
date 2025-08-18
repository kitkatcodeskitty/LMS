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
  FaEdit,
  FaWallet,
  FaPlane,
  FaCoins,
  FaPiggyBank,
  FaUser,
  FaMedal,
  FaAward
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
  
  // Calculate progress percentage for free trip (example: based on referrals)
  const freeTripProgress = Math.min((referralData.length / 25) * 100, 100);

  // Add custom CSS animations for progress bar effects
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes wave {
        0%, 100% { transform: translateX(-100%); }
        50% { transform: translateX(100%); }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .animate-wave {
        animation: wave 3s ease-in-out infinite;
      }
      
      .animate-shimmer {
        animation: shimmer 2s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 px-2 sm:px-3 md:px-4 lg:px-6">
      {/* Profile Section - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 text-white shadow-lg md:shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 md:space-x-4">
            <div className="relative flex justify-center sm:justify-start">
              <img
                src={userData.imageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 border-white/30 object-cover"
              />
              {userData.kycStatus === 'verified' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white">
                  <FaAward className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate flex items-center justify-center sm:justify-start">
                {fullName || 'Welcome!'}
                {userData.kycStatus === 'verified' && (
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-200 ml-1 sm:ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </h1>
              <p className="text-rose-100 truncate text-xs sm:text-sm md:text-base">
                {!userData.isAdmin ? (
                  purchasedCourses.length > 0 
                    ? `Latest: ${purchasedCourses[0].courseTitle || 'Recent Course'}`
                    : 'No courses enrolled yet'
                ) : (
                  'Administrator'
                )}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start mt-2 gap-1 sm:gap-2">
                {userData.isAdmin ? (
                  <span className="bg-white/20 px-2 py-1 sm:px-2.5 md:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center space-x-1">
                    <FaCrown className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> <span>Admin</span>
                  </span>
                ) : (
                  purchasedCourses.length > 0 && (
                    <span className="bg-white/20 px-2 py-1 sm:px-2.5 md:px-3 rounded-full text-xs sm:text-sm font-medium flex items-center space-x-1">
                      <FaBook className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" /> 
                      <span>{purchasedCourses.length} Course{purchasedCourses.length !== 1 ? 's' : ''}</span>
                    </span>
                  )
                )}
                {userData.kycStatus && (
                  <span className={`px-2 py-1 sm:px-2.5 md:px-3 rounded-full text-xs font-medium flex items-center space-x-1 ${
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
        </div>

        {/* Today Earning Progress Bar */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 space-y-2 sm:space-y-0">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Today Earning Progress</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Daily earning target</p>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl text-green-600">
              <FaChartLine />
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700">
              <span>Rs {earningsData.today || 0}/-</span>
              <span>Rs 20,000/-</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 md:h-4 overflow-hidden relative">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 sm:h-3 md:h-4 rounded-full transition-all duration-1000 relative"
                style={{ width: `${Math.min((earningsData.today || 0) / 20000 * 100, 100)}%` }}
              >
                {/* Liquid wave animation when progress is low */}
                {(earningsData.today || 0) < 1000 && (
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-80 animate-pulse">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    </div>
                    {/* Animated wave effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300/40 to-green-400/40 animate-wave"></div>
                  </div>
                )}
              </div>
              
              {/* Floating particles when no progress */}
              {(earningsData.today || 0) === 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              )}
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500">
                Current Progress: {Math.round((earningsData.today || 0) / 20000 * 100)}% 
                ({earningsData.today || 0} of 20,000)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content - Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Left Column - Earnings Dashboard */}
        <div className="xl:col-span-2 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Large Today Earning Card */}
          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-purple-200">
            <div className="flex flex-col lg:flex-row items-center space-y-3 sm:space-y-4 lg:space-y-0 lg:space-x-4 md:lg:space-x-6">
              {/* Illustration Side */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto lg:mx-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FaCoins className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-pink-500 rounded-full flex items-center justify-center">
                    <FaPiggyBank className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FaChartLine className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Today Earning</h2>
                                 <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-2 sm:mb-3 md:mb-4">
                   <AnimatedNumber 
                     value={earningsData.today || 0} 
                     currency="Rs " 
                     duration={2000} 
                     delay={300} 
                   />/-
                 </div>
                <p className="text-gray-600 text-xs sm:text-sm">Track your daily earnings progress</p>
              </div>
            </div>
          </div>

          {/* Other Earnings Grid - Responsive Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            {/* Last 7 Days Earning */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">Last 7 Days Earning</h4>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaDollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
              </div>
                             <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                 <AnimatedNumber 
                   value={earningsData.lastSevenDays || 0} 
                   currency="Rs " 
                   duration={2000} 
                   delay={400} 
                 />/-
               </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* All Time Earning */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">All Time Earning</h4>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FaChartBar className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600" />
                </div>
              </div>
                             <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                 <AnimatedNumber 
                   value={earningsData.lifetime || 0} 
                   currency="Rs " 
                   duration={2000} 
                   delay={500} 
                 />/-
               </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Last 30 Days Earning */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">Last 30 Days Earning</h4>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaCalendarAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-purple-600" />
                </div>
              </div>
                             <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                 <AnimatedNumber 
                   value={earningsData.thisMonth || 0} 
                   currency="Rs " 
                   duration={2000} 
                   delay={600} 
                 />/-
               </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div className="bg-purple-500 h-1.5 sm:h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <h4 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">Wallet Balance</h4>
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <FaWallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-orange-600" />
                </div>
              </div>
                             <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                 <AnimatedNumber 
                   value={earningsData.currentBalance || 0} 
                   currency="Rs " 
                   duration={2000} 
                   delay={700} 
                 />/-
               </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 mt-2">
                <div className="bg-orange-500 h-1.5 sm:h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Withdrawal & Progress Dashboard */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-pink-200">
            <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
              {/* Illustration */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <FaWallet className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <FaChartLine className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-white" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Wallet Balance</h3>
                                 <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-2 sm:mb-3 md:mb-4">
                   <AnimatedNumber 
                     value={earningsData.currentBalance || 0} 
                     currency="Rs " 
                     duration={2000} 
                     delay={800} 
                   />/-
                 </div>
                <button
                  onClick={() => setActiveTab('withdrawal-request')}
                  disabled={!earningsData.withdrawableBalance || earningsData.withdrawableBalance <= 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-semibold py-1.5 sm:py-2 md:py-2.5 px-3 sm:px-4 rounded-md sm:rounded-lg transition-colors duration-200 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Free Trip Progress Card */}
          <div className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-pink-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600 mr-1 sm:mr-2" />
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900">Your Free Trip Target</h3>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-700">
                  <span>Achieved: {referralData.length}</span>
                  <span>Target: 25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 sm:h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${freeTripProgress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">
                  {referralData.length >= 25 ? (
                    <span className="flex items-center justify-center">
                      <FaTrophy className="w-3 h-3 mr-1 text-yellow-500" />
                      Target Achieved!
                    </span>
                  ) : (
                    `${25 - referralData.length} more referrals needed`
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg md:shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div>
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Common tasks</p>
              </div>
              <div className="text-lg sm:text-xl md:text-2xl">
                <FaBolt />
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate('/courses')}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md sm:rounded-lg md:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                <FaGraduationCap className="text-sm sm:text-base md:text-lg lg:text-xl" />
                <span className="font-medium text-xs sm:text-sm">Browse Courses</span>
              </button>

              <button
                onClick={() => setActiveTab('referrals')}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md sm:rounded-lg md:rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                <FaUsers className="text-sm sm:text-base md:text-lg lg:text-xl" />
                <span className="font-medium text-xs sm:text-sm">View Referrals</span>
              </button>

              <button
                onClick={() => setActiveTab('edit')}
                className="w-full flex items-center space-x-2 sm:space-x-3 p-2 sm:p-2.5 md:p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-md sm:rounded-lg md:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-xs sm:text-sm"
              >
                <FaEdit className="text-sm sm:text-base md:text-lg lg:text-xl" />
                <span className="font-medium text-xs sm:text-sm">Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
