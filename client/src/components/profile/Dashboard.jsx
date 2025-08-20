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
  FaAward,
  FaStar,
  FaRocket,
  FaLightbulb,
  FaHeart,
  FaShieldAlt
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

  // Add custom CSS animations for enhanced effects
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
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
        50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6); }
      }
      
      .animate-wave {
        animation: wave 3s ease-in-out infinite;
      }
      
      .animate-shimmer {
        animation: shimmer 2s linear infinite;
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
      
      .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .gradient-border {
        background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: gradient-shift 3s ease infinite;
      }
      
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      {/* Top Header Section - User Profile */}
      <div className="mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <img
                  src={userData.imageUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full rounded-full border-4 border-orange-200 object-cover shadow-lg"
                />
                {userData.kycStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                    <FaShieldAlt className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2">
                {fullName || 'Welcome!'}
              </h1>
              <p className="text-lg text-gray-800 font-medium">
                PACKAGE: {purchasedCourses.length > 0 ? 
                  (purchasedCourses[0].courseTitle || 'SUPREME') : 
                  'SUPREME'
                }
              </p>
              {userData.isAdmin && (
                <div className="mt-2 inline-flex items-center space-x-2 bg-yellow-100 px-3 py-1 rounded-full">
                  <FaCrown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Right - Today's Earning Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Today Earning</h3>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  ₹ {earningsData.today || 0}/-
                </div>
                <div className="text-sm text-gray-500">Target: ₹ 29,952/-</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min((earningsData.today || 0) / 29952 * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>Current: ₹ {earningsData.today || 0}/-</span>
              <span>Target: ₹ 29,952/-</span>
            </div>
          </div>

          {/* Large Today Earning Card */}
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl p-6 lg:p-8 shadow-xl border border-purple-200">
            <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Illustration Side */}
              <div className="flex-shrink-0 text-center lg:text-left">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto lg:mx-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <FaCoins className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                    <FaPiggyBank className="w-3 h-3 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
                    <FaChartLine className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
              </div>

              {/* Content Side */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Today Earning</h2>
                <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-3">
                  <AnimatedNumber 
                    value={earningsData.today || 0} 
                    currency="₹ " 
                    duration={2000} 
                    delay={300} 
                  />/-
                </div>
                <p className="text-gray-600">Track your daily earnings progress</p>
              </div>
            </div>
          </div>

          {/* Other Earnings Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Last 7 Days Earning */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaDollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-600 mb-1">
                <AnimatedNumber 
                  value={earningsData.lastSevenDays || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={400} 
                />/-
              </div>
              <div className="text-xs text-gray-600">Last 7 Days</div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* All Time Earning */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaChartBar className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600 mb-1">
                <AnimatedNumber 
                  value={earningsData.lifetime || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={500} 
                />/-
              </div>
              <div className="text-xs text-gray-600">All Time</div>
              <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Last 30 Days Earning */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaCalendarAlt className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-600 mb-1">
                <AnimatedNumber 
                  value={earningsData.thisMonth || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={600} 
                />/-
              </div>
              <div className="text-xs text-gray-600">Last 30 Days</div>
              <div className="w-full bg-purple-200 rounded-full h-1.5 mt-2">
                <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaWallet className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-orange-600 mb-1">
                <AnimatedNumber
                  value={earningsData.currentBalance || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={700} 
                />/-
              </div>
              <div className="text-xs text-gray-600">Wallet</div>
              <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Side Cards */}
        <div className="space-y-6">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6 shadow-xl border border-pink-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaWallet className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wallet Balance</h3>
              <div className="text-3xl font-bold text-orange-600 mb-4">
                <AnimatedNumber 
                  value={earningsData.currentBalance || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={800} 
                />/-
              </div>
              <button
                onClick={() => setActiveTab('withdrawal-request')}
                disabled={!earningsData.withdrawableBalance || earningsData.withdrawableBalance <= 0}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Free Trip Progress Card */}
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-6 shadow-xl border border-blue-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <FaPlane className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Your free trip achieved target</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                  <span>Achieved: {referralData.length}</span>
                  <span>Target: 25</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${freeTripProgress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {referralData.length >= 25 ? (
                    <span className="flex items-center justify-center text-emerald-600 font-semibold">
                      <FaTrophy className="w-4 h-4 mr-2 text-yellow-500" />
                      Target Achieved! 🎉
                    </span>
                  ) : (
                    `${25 - referralData.length} more referrals needed`
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600 text-sm">Get started quickly</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <FaBolt className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/packages-list')}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaGraduationCap className="w-4 h-4" />
                <span className="font-medium text-sm">Browse Packages</span>
              </button>

              <button
                onClick={() => setActiveTab('referrals')}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaUsers className="w-4 h-4" />
                <span className="font-medium text-sm">View Referrals</span>
              </button>

              <button
                onClick={() => setActiveTab('edit')}
                className="w-full flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaEdit className="w-4 h-4" />
                <span className="font-medium text-sm">Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
