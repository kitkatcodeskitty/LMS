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
  FaShieldAlt,
  FaArrowUp,
  FaFire,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft
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

  // Get the latest purchased package
  const latestPackage = purchasedCourses.length > 0 ? purchasedCourses[0] : null;
  
  // Get the latest course name for display
  const latestCourseName = latestPackage ? 
    (latestPackage.courseTitle || 'Latest Course') : 
    'No courses enrolled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      {/* Top Section - Profile Card Only */}
      <div className="mb-8 animate-fade-in">
        {/* User Profile Card - Full Width */}
        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600 rounded-2xl p-6 shadow-lg border-0 hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-6">
            {/* Profile Image with KYC Blue Tick */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24">
                <img
                  src={userData.imageUrl || '/default-avatar.png'}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                />
                {userData.kycStatus === 'verified' && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                    <FaCheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* User Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">{fullName || 'Welcome!'}</h2>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                <p className="text-sm font-semibold text-white">
                  PACKAGE: {latestPackage ? latestPackage.packageType?.toUpperCase() || 'SUPREME' : 'SUPREME'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Today Earning and Wallet Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Today Earning Card - Left */}
        <div className="bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg border-0 animate-slide-in-left hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Side - Simple Illustration */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
                <div className="flex space-x-2 justify-center">
                  <FaCoins className="w-4 h-4 text-yellow-200" />
                  <FaPiggyBank className="w-4 h-4 text-pink-200" />
                  <FaDollarSign className="w-4 h-4 text-emerald-200" />
                </div>
              </div>
            </div>
            
            {/* Right Side - Text */}
            <div className="flex-1 text-center lg:text-right">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Today Earning</h2>
              <div className="text-2xl sm:text-3xl font-bold text-orange-300 mb-2">
                ₹ {earningsData.today || 0}/-
              </div>
              <p className="text-purple-100 text-sm">Track your daily earnings</p>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card - Right */}
        <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-lg border-0 animate-slide-in-right hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-2">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <FaWallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center lg:text-right">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Wallet Balance</h3>
              <div className="text-2xl sm:text-3xl font-bold text-orange-300 mb-4">
                ₹ {earningsData.availableBalance || 0}/-
              </div>
              <button
                onClick={() => setActiveTab('withdrawal-request')}
                disabled={!earningsData.availableBalance || earningsData.availableBalance <= 0}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-gray-400/50 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md border border-white/30"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Other Earnings */}
      <div className="mb-8 animate-fade-in-up">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaChartBar className="w-5 h-5 text-blue-500 mr-2" />
          Other
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Last 7 Days Earning */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 animate-card-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Last 7 Days</h4>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold shadow-sm">
                  ₹ {earningsData.lastSevenDays || 0}/-
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <FaDollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Last 30 Days Earning */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 animate-card-2">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Last 30 Days</h4>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold shadow-sm">
                  ₹ {earningsData.thisMonth || 0}/-
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <FaDollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* All Time Earning */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 animate-card-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">All Time</h4>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold shadow-sm">
                  ₹ {earningsData.lifetime || 0}/-
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <FaDollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 ease-out transform hover:-translate-y-1 animate-card-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Wallet</h4>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full inline-block text-sm font-semibold shadow-sm">
                  ₹ {earningsData.availableBalance || 0}/-
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-md">
                <FaDollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Free Trip Target Card - Below the 2x2 Grid */}
        <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-2xl p-5 shadow-lg border-0 hover:shadow-xl transition-all duration-300 ease-out transform hover:-translate-y-1 animate-fade-in-up-delay">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center">
            <FaPlane className="w-4 h-4 text-cyan-200 mr-2" />
            Free Trip Target
          </h3>
          <div className="w-full bg-white/20 h-2 rounded-full mb-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-200 to-blue-300 h-2 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min((referralData.length / 25) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-white">
            <span>Achieved: {referralData.length}</span>
            <span>Target: 25</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes slide-in-left {
          from { 
            opacity: 0; 
            transform: translateX(-30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        @keyframes slide-in-right {
          from { 
            opacity: 0; 
            transform: translateX(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .animate-card-1 {
          animation: fade-in-up 0.8s ease-out 0.1s both;
        }
        
        .animate-card-2 {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        
        .animate-card-3 {
          animation: fade-in-up 0.8s ease-out 0.3s both;
        }
        
        .animate-card-4 {
          animation: fade-in-up 0.8s ease-out 0.4s both;
        }
        
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.5s both;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
