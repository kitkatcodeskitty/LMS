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
          {/* Show course names for students instead of count */}
          {!userData.isAdmin ? (
            <p className="text-rose-100 truncate">
              {purchasedCourses.length > 0 
                ? purchasedCourses.length === 1 
                  ? purchasedCourses[0].title || 'Course Enrolled'
                  : `${purchasedCourses.length} Courses Enrolled`
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
                  <FaGraduationCap /> 
                  <span>
                    {purchasedCourses.length === 1 
                      ? purchasedCourses[0].title || 'Course Enrolled'
                      : `${purchasedCourses.length} Courses`
                    }
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

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Lifetime Earnings</p>
              <p className="text-3xl font-bold mt-2">
                <AnimatedNumber value={earningsData.lifetime} currency={currency} duration={2500} delay={200} />
              </p>
              <p className="text-green-100 text-xs mt-1">+12% from last month</p>
            </div>
            <div className="text-4xl opacity-80">
              <FaGem />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Today's Earnings</p>
              <p className="text-3xl font-bold mt-2">
                <AnimatedNumber value={earningsData.today} currency={currency} duration={2000} delay={400} />
              </p>
              <p className="text-blue-100 text-xs mt-1">Active today</p>
            </div>
            <div className="text-4xl opacity-80">
              <FaChartLine />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Last 7 Days</p>
              <p className="text-3xl font-bold mt-2">
                <AnimatedNumber value={earningsData.lastSevenDays} currency={currency} duration={2200} delay={600} />
              </p>
              <p className="text-purple-100 text-xs mt-1">Weekly performance</p>
            </div>
            <div className="text-4xl opacity-80">
              <FaChartBar />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">This Month</p>
              <p className="text-3xl font-bold mt-2">
                <AnimatedNumber value={earningsData.thisMonth} currency={currency} duration={2300} delay={800} />
              </p>
              <p className="text-orange-100 text-xs mt-1">Monthly progress</p>
            </div>
            <div className="text-4xl opacity-80">
              <FaCalendarAlt />
            </div>
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
              <FaDollarSign className="text-xl" />
              <span className="font-medium">View Earnings</span>
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
