import React from 'react';
import AnimatedNumber from '../common/AnimatedNumber';
import {
  FaCrown,
  FaChartLine,
  FaChartBar,
  FaCalendarAlt,
  FaBook,
  FaUsers,
  FaTrophy,
  FaBolt,
  FaWallet,
  FaPlane,
  FaUser,
  FaFire,
  FaArrowRight,
  FaShareAlt,
  FaCheckCircle
} from 'react-icons/fa';

const Dashboard = ({
  userData,
  earningsData,
  purchasedCourses,
  referralData,
  navigate,
  setActiveTab
}) => {
  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();

  // Get the latest purchased package
  const latestPackage = purchasedCourses.length > 0 ? purchasedCourses[0] : null;

  // Get the latest course name for display
  const latestCourseName = latestPackage ?
    (latestPackage.courseTitle || 'Latest Course') :
    'No courses enrolled';

  // Get the package type dynamically - check multiple possible properties
  const getPackageType = () => {
    if (!latestPackage) return 'USER';

    // Check different possible properties where package type might be stored
    const packageType = latestPackage.packageType ||
      latestPackage.package?.packageType ||
      latestPackage.course?.packageType ||
      latestPackage.type ||
      latestPackage.courseTitle?.split(' ')[0] || // Try to extract from package name if it starts with package name
      null;

    return packageType ? packageType.toUpperCase() : 'USER';
  };

  const currentPackageType = getPackageType();

  // Use userData earnings fields as fallback if earningsData is not available
  const getEarningsValue = (field, fallback = 0) => {
    if (earningsData && earningsData[field] !== undefined) {
      return earningsData[field]
    }
    // Fallback to userData fields
    return userData[field] || fallback
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16">
                {userData.imageUrl ? (
                  <img
                    src={userData.imageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-3 border-white shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div
                  className={`w-full h-full rounded-full bg-white/20 backdrop-blur-sm border-3 border-white shadow-md flex items-center justify-center ${userData.imageUrl ? 'hidden' : 'flex'
                    }`}
                >
                  <FaUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>

                {/* Clean verification badge using React icon */}
                {userData.kycStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
                    <FaCheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-white/80 mb-1">Welcome Back!</div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 flex items-center">
                <span className="truncate">{fullName || 'Amy Amy'}</span>
                                                                  {userData.kycStatus === 'verified' && (
                    <div className="ml-2 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 flex-shrink-0">
                      <FaCheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                    </div>
                  )}
              </h1>
              <div className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full inline-block">
                <span className="text-xs font-semibold text-white flex items-center">
                  <FaCrown className="w-3 h-3 mr-1" />
                  {currentPackageType} MEMBER
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Earnings</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('lifetime', getEarningsValue('affiliateEarnings', 0))} 
                    currency="Rs" 
                    duration={2000} 
                    delay={100} 
                  />
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/80">Network</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  <AnimatedNumber 
                    value={referralData.length} 
                    duration={1800} 
                    delay={200} 
                  />
                </span>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-1 sm:mt-2 w-full bg-white/20 backdrop-blur-sm rounded-xl p-2 text-white hover:bg-white/30 transition-colors text-xs"
              title="Refresh data after admin updates"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Today's Earnings */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</span>
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-1">Today's Earnings</h3>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              <AnimatedNumber 
                value={getEarningsValue('today', getEarningsValue('dailyEarnings', 0))} 
                currency="Rs" 
                duration={2200} 
                delay={300} 
              />
            </div>
            <div className="text-xs text-white/80">Daily Performance</div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-white/40 w-3/4"></div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <FaWallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button
              onClick={() => setActiveTab('withdrawal')}
              className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
            >
              Withdraw
            </button>
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-1">Available Balance</h3>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              <AnimatedNumber 
                value={getEarningsValue('availableBalance', getEarningsValue('withdrawableBalance', 0))} 
                currency="Rs" 
                duration={2400} 
                delay={400} 
              />
            </div>
            <div className="text-xs text-white/80">Ready to Withdraw</div>
          </div>
          <div className="text-xs text-white/80 mt-2">+ Available Now</div>
        </div>

        {/* Total Referrals */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-white/20 rounded-lg p-2">
              <FaUsers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <button className="text-xs bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors">
              View All
            </button>
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-semibold mb-1">Total Referrals</h3>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              <AnimatedNumber 
                value={referralData.length} 
                duration={2000} 
                delay={500} 
              />
            </div>
            <div className="text-xs text-white/80">Active Network</div>
          </div>
          <div className="text-xs text-white/80 mt-2">Growing</div>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center mb-4 sm:mb-6">
          <div className="bg-blue-100 rounded-lg p-2 mr-3">
            <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Earnings Overview</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Last Week */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <FaCalendarAlt className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">7 Days</span>
            </div>
            <div className="text-sm text-white/80 mb-1">Last Week</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              <AnimatedNumber 
                value={getEarningsValue('lastSevenDays', getEarningsValue('weeklyEarnings', 0))} 
                currency="Rs" 
                duration={2600} 
                delay={600} 
              />
            </div>
            <div className="text-xs text-white/70">Weekly performance</div>
          </div>

          {/* This Month */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 sm:p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <FaChartLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">30 Days</span>
            </div>
            <div className="text-sm text-white/80 mb-1">This Month</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              <AnimatedNumber 
                value={getEarningsValue('thisMonth', getEarningsValue('monthlyEarnings', 0))} 
                currency="Rs" 
                duration={2800} 
                delay={700} 
              />
            </div>
            <div className="text-xs text-white/70">Monthly growth</div>
          </div>

          {/* All Time */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-3 sm:p-4 text-white sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-white/20 rounded-lg p-2">
                <FaTrophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-white/80 font-medium">Lifetime</span>
            </div>
            <div className="text-sm text-white/80 mb-1">All Time</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              <AnimatedNumber 
                value={getEarningsValue('lifetime', getEarningsValue('affiliateEarnings', 0))} 
                currency="Rs" 
                duration={3000} 
                delay={800} 
              />
            </div>
            <div className="text-xs text-white/70">Total achievement</div>
          </div>
        </div>
      </div>

      {/* Free Trip Target & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Free Trip Target */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white">
          <div className="flex items-center mb-4">
            <FaPlane className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold">Free Trip Target</h3>
            <span className="ml-auto text-sm bg-white/20 px-2 py-1 rounded-full">
              {Math.round((referralData.length / 25) * 100)}%
            </span>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{referralData.length}/25</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((referralData.length / 25) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                <AnimatedNumber 
                  value={referralData.length} 
                  duration={1500} 
                  delay={900} 
                />
              </div>
              <div className="text-xs text-white/80">Achieved</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                <AnimatedNumber 
                  value={25} 
                  duration={1200} 
                  delay={1000} 
                />
              </div>
              <div className="text-xs text-white/80">Target</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-bold text-white">
                <AnimatedNumber 
                  value={Math.max(25 - referralData.length, 0)} 
                  duration={1300} 
                  delay={1100} 
                />
              </div>
              <div className="text-xs text-white/80">Remaining</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaBolt className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mr-2" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Quick Actions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('earnings')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-200 flex flex-col items-center"
            >
              <FaChartLine className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-xs sm:text-sm font-medium">Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawal')}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-200 flex flex-col items-center"
            >
              <FaWallet className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-xs sm:text-sm font-medium">Withdraw</span>
            </button>

            <button
              onClick={() => setActiveTab('referrals')}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-200 flex flex-col items-center"
            >
              <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-xs sm:text-sm font-medium">My Team</span>
            </button>

            <button
              onClick={() => setActiveTab('affiliated-link')}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 sm:p-3 rounded-xl hover:shadow-lg transition-all duration-200 flex flex-col items-center"
            >
              <FaShareAlt className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
              <span className="text-xs sm:text-sm font-medium">Share Link</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center mb-4 sm:mb-6">
          <FaFire className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Activity</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* My Packages */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer text-white" onClick={() => setActiveTab('my-packages')}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 rounded-lg p-2">
                <FaBook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <FaArrowRight className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-1">My Packages</h3>
            <p className="text-sm text-white/80 mb-2">
              <AnimatedNumber 
                value={purchasedCourses.length} 
                duration={1000} 
                delay={1200} 
              /> enrolled
            </p>
            <p className="text-xs text-white/70">Latest: {purchasedCourses.length > 0 ? latestCourseName : 'No courses enrolled'}</p>
          </div>

          {/* Leaderboard */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer text-white" onClick={() => setActiveTab('leaderboard')}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 rounded-lg p-2">
                <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <FaArrowRight className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-1">Leaderboard</h3>
            <p className="text-sm text-white/80 mb-2">Your ranking</p>
            <p className="text-xs text-white/70">Check your position</p>
          </div>

          {/* Edit Profile */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer text-white sm:col-span-2 lg:col-span-1" onClick={() => navigate('/profile')}>
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 rounded-lg p-2">
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <FaArrowRight className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-1">Edit Profile</h3>
            <p className="text-sm text-white/80 mb-2">Update your info</p>
            <p className="text-xs text-white/70">Keep profile updated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
