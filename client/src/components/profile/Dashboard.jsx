import React, { useEffect, useState } from 'react';
import AnimatedNumber from '../common/AnimatedNumber';

// Add floating animation styles
const floatingAnimations = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    25% { transform: translateY(-8px) translateX(4px) rotate(1deg); }
    50% { transform: translateY(-4px) translateX(-2px) rotate(-1deg); }
    75% { transform: translateY(-12px) translateX(6px) rotate(2deg); }
  }
  
  @keyframes float-medium {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    33% { transform: translateY(-6px) translateX(3px) rotate(1deg); }
    66% { transform: translateY(-10px) translateX(-1px) rotate(-1deg); }
  }
  
  @keyframes float-fast {
    0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    50% { transform: translateY(-4px) translateX(2px) rotate(0.5deg); }
  }
  
  .animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
  }
  
  .animate-float-medium {
    animation: float-medium 4s ease-in-out infinite;
  }
  
  .animate-float-fast {
    animation: float-fast 3s ease-in-out infinite;
  }
`;
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
  FaCheckCircle,
  FaDollarSign
} from 'react-icons/fa';

const Dashboard = ({
  userData,
  earningsData,
  purchasedCourses,
  referralData,
  navigate,
  setActiveTab,
  currency,
  affiliateLink,
  copyToClipboard
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);

  // Function to handle tab changes with scroll to top
  const handleTabChange = (tabName) => {
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Set the active tab
    setActiveTab(tabName);
  };

  useEffect(() => {
    // Trigger initial load animation
    setIsLoaded(true);
    
    // Trigger card animations with delay
    const timer = setTimeout(() => {
      setAnimateCards(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

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
    <>
      <style dangerouslySetInnerHTML={{ __html: floatingAnimations }} />
      <div className={`min-h-screen bg-white p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Profile Header - Mobile Design */}
      <div className={`lg:hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-4 sm:p-6 shadow-lg border border-blue-200/30 relative overflow-hidden transition-all duration-700 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl transition-all duration-1000 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-slow`}></div>
          <div className={`absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl transition-all duration-1000 delay-300 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-medium`}></div>
          <div className={`absolute top-1/2 -left-4 w-16 h-16 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-lg transition-all duration-1000 delay-500 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-fast`}></div>
          <div className={`absolute top-1/4 -right-2 w-12 h-12 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-md transition-all duration-1000 delay-700 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-medium`}></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between">
          {/* Left Section - Profile Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                {userData.imageUrl ? (
                  <img
                    src={userData.imageUrl}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white/80 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <FaUser className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}

                {/* Verification badge on avatar */}
                {userData.kycStatus === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <defs>
                        <linearGradient id="blueGradientProfileMobile" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                        fill="url(#blueGradientProfileMobile)"
                      />
                      <path
                        d="M35 52 L45 62 L70 38"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg sm:text-xl font-bold text-blue-700">
                  {fullName || 'User Name'}
                </h1>
                {/* Blue tick for KYC verification */}
                {userData.kycStatus === 'verified' && (
                  <div className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 100 100"
                      className="w-5 h-5 drop-shadow-lg"
                    >
                      <defs>
                        <linearGradient id="blueGradientNameMobile" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                        fill="url(#blueGradientNameMobile)"
                      />
                      <path
                        d="M35 52 L45 62 L70 38"
                        stroke="white"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-300/30">
                <span className="text-sm font-semibold text-purple-700 uppercase">
                  {currentPackageType} MEMBER
                </span>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Desktop Header Layout */}
      <div className={`hidden lg:flex items-center justify-between bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-blue-200/30 relative overflow-hidden transition-all duration-700 delay-200 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl transition-all duration-1000 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-slow`}></div>
          <div className={`absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl transition-all duration-1000 delay-300 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-medium`}></div>
          <div className={`absolute top-1/3 -left-6 w-20 h-20 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-lg transition-all duration-1000 delay-500 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-fast`}></div>
          <div className={`absolute bottom-1/3 -right-4 w-12 h-12 bg-gradient-to-br from-rose-400/15 to-pink-400/15 rounded-full blur-md transition-all duration-1000 delay-700 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-slow`}></div>
          <div className={`absolute top-1/4 right-1/4 w-8 h-8 bg-gradient-to-br from-rose-300/12 to-purple-400/12 rounded-full blur-sm transition-all duration-1000 delay-900 ${animateCards ? 'scale-100' : 'scale-0'} animate-float-fast`}></div>
        </div>
        
        {/* Left Section - Profile Info */}
        <div className="relative z-10 flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16">
              {userData.imageUrl ? (
                <img
                  src={userData.imageUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white/80 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <FaUser className="w-8 h-8 text-white" />
                </div>
              )}

              {/* Verification badge on avatar */}
              {userData.kycStatus === 'verified' && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    className="w-full h-full drop-shadow-lg"
                  >
                    <defs>
                      <linearGradient id="blueGradientDesktop" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                      fill="url(#blueGradientDesktop)"
                    />
                    <path
                      d="M35 52 L45 62 L70 38"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-blue-700">
                {fullName || 'User Name'}
              </h1>
              {/* Blue tick for KYC verification */}
              {userData.kycStatus === 'verified' && (
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 100 100"
                    className="w-5 h-5 drop-shadow-lg"
                  >
                    <defs>
                      <linearGradient id="blueGradientNameDesktop" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                      fill="url(#blueGradientNameDesktop)"
                    />
                    <path
                      d="M35 52 L45 62 L70 38"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-1 rounded-full border border-purple-300/30">
              <span className="text-sm font-semibold text-purple-700 uppercase">
                {currentPackageType} MEMBER
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Today Earning */}
        <div className="relative z-10 text-right">
          <div className="text-sm text-gray-600 mb-1 font-medium">Today Earning</div>
          <div className="text-2xl font-bold text-purple-600">
            <AnimatedNumber 
              value={getEarningsValue('today', getEarningsValue('dailyEarnings', 0))} 
              currency={currency} 
              duration={2000} 
              delay={100} 
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout - Flexible Grid */}
      <div className={`hidden lg:grid lg:grid-cols-3 gap-6 transition-all duration-700 delay-400 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Left Column - Main Earnings (2 columns wide) */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 rounded-2xl p-8 shadow-lg relative overflow-hidden h-[240px] flex items-center text-gray-800 hover:shadow-2xl transition-all duration-300 group">
            {/* Background floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-4 right-4 w-8 h-8 bg-purple-400/20 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute bottom-6 left-6 w-6 h-6 bg-purple-300/15 rounded-full blur-sm animate-float-slow"></div>
              <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-purple-400/10 rounded-full blur-sm animate-float-fast"></div>
              <div className="absolute top-1/3 left-1/3 w-3 h-3 bg-orange-300/15 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-orange-200/20 rounded-full blur-sm animate-float-fast"></div>
            </div>
            <div className="relative z-10 flex items-center justify-between h-full">
              {/* Left Section - Illustration */}
              <div className="flex-1 flex items-center justify-center h-full">
                <img 
                  src="/6269576-removebg-preview.png" 
                  alt="Earning Illustration" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Right Section - Text Content */}
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                <h2 className="text-3xl font-bold text-gray-700 mb-2">Today Earning</h2>
                <div className="text-5xl font-bold text-orange-500">
                  <AnimatedNumber 
                    value={getEarningsValue('today', getEarningsValue('dailyEarnings', 0))} 
                    currency={currency} 
                    duration={2500} 
                    delay={500} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Withdrawal Card */}
        <div>
          <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-6 shadow-lg text-center h-[240px] flex flex-col justify-center text-white hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
            {/* Background floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-3 left-3 w-6 h-6 bg-white/8 rounded-full blur-sm animate-float-fast"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 bg-white/5 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/6 rounded-full blur-sm animate-float-slow"></div>
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-rose-300/12 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-rose-200/15 rounded-full blur-sm animate-float-fast"></div>
            </div>
            <div className="relative z-10 w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <FaWallet className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="relative z-10 text-sm font-medium text-white/80 mb-2">Wallet Balance</div>
            <div className="relative z-10 text-2xl font-bold text-white mb-4">
              <AnimatedNumber 
                value={getEarningsValue('availableBalance', getEarningsValue('withdrawableBalance', 0))} 
                currency={currency} 
                duration={2000} 
                delay={700} 
              />
            </div>
            <button 
              onClick={() => handleTabChange('withdrawal')}
              className="relative z-10 bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/20"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Main Earnings Section */}
      <div className={`lg:hidden bg-white rounded-3xl p-6 shadow-lg border border-blue-100/50 relative overflow-hidden transition-all duration-700 delay-300 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="space-y-6">
          {/* Today Earning */}
          <div className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 rounded-2xl p-6 text-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
            {/* Background floating elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400/20 rounded-full blur-sm animate-float-fast"></div>
              <div className="absolute bottom-3 right-3 w-3 h-3 bg-purple-300/15 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-purple-400/10 rounded-full blur-sm animate-float-slow"></div>
              <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-orange-300/15 rounded-full blur-sm animate-float-medium"></div>
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-orange-200/20 rounded-full blur-sm animate-float-fast"></div>
            </div>
            <div className="relative z-10 flex flex-col h-full">
              {/* Top Section - Text Content */}
              <div className="text-center mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Today Earning</div>
                <div className="text-2xl font-bold text-orange-500 mb-2">
                  <AnimatedNumber 
                    value={getEarningsValue('today', getEarningsValue('dailyEarnings', 0))} 
                    currency={currency} 
                    duration={2000} 
                    delay={700} 
                  />
                </div>
                <div className="text-xs text-gray-600">Daily earnings</div>
              </div>
              
              {/* Bottom Section - Illustration */}
              <div className="flex-1 flex items-center justify-center">
                <img 
                  src="/6269576-removebg-preview.png" 
                  alt="Earning Illustration" 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* Desktop Other Earnings Section */}
      <div className={`hidden lg:block bg-white rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-700 delay-500 ${animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h3 className="text-xl font-bold text-gray-800 mb-6">Other Earnings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Last 7 Days Earning */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">Last 7 Days Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('lastSevenDays', getEarningsValue('weeklyEarnings', 0))} 
                    currency={currency} 
                    duration={2000} 
                    delay={900} 
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <FaCalendarAlt className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Last 30 Days Earning */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">Last 30 Days Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('thisMonth', getEarningsValue('monthlyEarnings', 0))} 
                    currency={currency} 
                    duration={2200} 
                    delay={1100} 
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <FaChartLine className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* All Time Earning */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">All Time Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('lifetime', getEarningsValue('affiliateEarnings', 0))} 
                    currency={currency} 
                    duration={2400} 
                    delay={1300} 
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <FaTrophy className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">Wallet Balance</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('availableBalance', getEarningsValue('withdrawableBalance', 0))} 
                    currency={currency} 
                    duration={2000} 
                    delay={1500} 
                  />
                </div>
              </div>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <FaWallet className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Other Earnings Section */}
      <div className="lg:hidden bg-white rounded-3xl p-6 shadow-lg border border-blue-100/50">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
          Other Earnings
        </h3>
        
        <div className="space-y-4">
          {/* Last 7 Days Earning */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">Last 7 Days Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('lastSevenDays', getEarningsValue('weeklyEarnings', 0))} 
                    currency={currency} 
                    duration={2000} 
                    delay={900} 
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <FaCalendarAlt className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Last 30 Days Earning */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">Last 30 Days Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('thisMonth', getEarningsValue('monthlyEarnings', 0))} 
                    currency={currency} 
                    duration={2200} 
                    delay={1100} 
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <FaChartLine className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* All Time Earning */}
          <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1 font-medium">All Time Earning</div>
                <div className="text-xl font-bold text-white">
                  <AnimatedNumber 
                    value={getEarningsValue('lifetime', getEarningsValue('affiliateEarnings', 0))} 
                    currency={currency} 
                    duration={2400} 
                    delay={1300} 
                  />
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <FaTrophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Withdrawal Section */}
      <div className="lg:hidden bg-white rounded-3xl p-6 shadow-lg border border-blue-100/50">
        <div className="flex items-center mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-red-500 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-800">Wallet & Withdrawal</h3>
        </div>
        
        <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaWallet className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="text-sm font-medium text-white/80 mb-2">Wallet Balance</div>
            <div className="text-2xl font-bold text-white mb-4">
              <AnimatedNumber 
                value={getEarningsValue('availableBalance', getEarningsValue('withdrawableBalance', 0))} 
                currency={currency} 
                duration={2000} 
                delay={700} 
              />
            </div>
                          <button 
                onClick={() => handleTabChange('withdrawal')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/20"
              >
                Withdraw
              </button>
          </div>
        </div>
      </div>



      {/* Desktop Withdrawal Section */}
      <div className="hidden bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-2 h-6 bg-gradient-to-b from-rose-500 to-red-500 rounded-full mr-3"></div>
          Wallet & Withdrawal
        </h3>
        
        <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaWallet className="w-10 h-10 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="text-sm font-medium text-white/80 mb-2">Wallet Balance</div>
            <div className="text-2xl font-bold text-white mb-4">
              <AnimatedNumber 
                value={getEarningsValue('availableBalance', getEarningsValue('withdrawableBalance', 0))} 
                currency={currency} 
                duration={2000} 
                delay={700} 
              />
            </div>
            <button 
              onClick={() => handleTabChange('withdrawal')}
              className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-white/20"
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Combined Section - Quick Actions & Recent Activity */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6">
        {/* Quick Actions & Free Trip Target */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleTabChange('earnings')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-2 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaDollarSign className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Earnings</span>
              </button>

              <button
                onClick={() => handleTabChange('withdrawal')}
                className="bg-gradient-to-br from-pink-500 to-red-500 text-white p-4 rounded-xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-2 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaWallet className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Withdraw</span>
              </button>

              <button
                onClick={() => handleTabChange('referrals')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-2 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaUsers className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">My Team</span>
              </button>

              <button
                onClick={() => handleTabChange('affiliated')}
                className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-2 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FaShareAlt className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Share Link</span>
              </button>
            </div>
          </div>


        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>

          <div className="space-y-4">
            {/* My Packages */}
            <div 
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
              onClick={() => handleTabChange('my-packages')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaBook className="w-5 h-5 text-white" />
                </div>
                <FaArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">My Packages</h3>
              <p className="text-xs text-white/80 mb-1">
                <AnimatedNumber 
                  value={purchasedCourses.length} 
                  duration={1000} 
                  delay={1200} 
                /> enrolled
              </p>
              <p className="text-xs text-white/60 truncate">Latest: {purchasedCourses.length > 0 ? latestCourseName : 'No courses'}</p>
            </div>

            {/* Leaderboard */}
            <div 
              className="bg-gradient-to-br from-pink-500 to-red-500 rounded-xl p-4 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
              onClick={() => handleTabChange('leaderboard')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaTrophy className="w-5 h-5 text-white" />
                </div>
                <FaArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Leaderboard</h3>
              <p className="text-xs text-white/80 mb-1">Your ranking</p>
              <p className="text-xs text-white/60">Check position</p>
            </div>

            {/* Edit Profile */}
            <div 
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
              onClick={() => navigate('/profile')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
                <FaArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Edit Profile</h3>
              <p className="text-xs text-white/80 mb-1">Update info</p>
              <p className="text-xs text-white/60">Keep updated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="lg:hidden bg-white rounded-3xl p-6 shadow-lg border border-blue-100/50">
        <div className="flex items-center mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
          <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleTabChange('earnings')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-3 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaDollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Earnings</span>
          </button>

                                <button
            onClick={() => handleTabChange('withdrawal')}
            className="bg-gradient-to-br from-rose-500 to-red-500 text-white p-4 rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-3 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaWallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Withdraw</span>
          </button>

          <button
            onClick={() => handleTabChange('referrals')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-3 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">My Team</span>
          </button>

                                <button
            onClick={() => handleTabChange('affiliated')}
            className="bg-gradient-to-br from-purple-500 to-rose-500 text-white p-4 rounded-2xl hover:shadow-xl transition-all duration-200 flex flex-col items-center space-y-3 group"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FaShareAlt className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium">Share Link</span>
          </button>
        </div>
      </div>

      {/* Mobile Recent Activity */}
      <div className="lg:hidden bg-white rounded-3xl p-6 shadow-lg border border-blue-100/50">
        <div className="flex items-center mb-6">
          <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></div>
          <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
        </div>

        <div className="space-y-4">
          {/* My Packages */}
          <div 
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
            onClick={() => handleTabChange('my-packages')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaBook className="w-6 h-6 text-white" />
              </div>
              <FaArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">My Packages</h3>
            <p className="text-white/80 mb-1">
              <AnimatedNumber 
                value={purchasedCourses.length} 
                duration={1000} 
                delay={1200} 
              /> enrolled courses
            </p>
            <p className="text-sm text-white/60">Latest: {purchasedCourses.length > 0 ? latestCourseName : 'No courses enrolled'}</p>
          </div>

          {/* Leaderboard */}
          <div 
            className="bg-gradient-to-br from-rose-500 to-red-500 rounded-2xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
            onClick={() => handleTabChange('leaderboard')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaTrophy className="w-6 h-6 text-white" />
              </div>
              <FaArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Leaderboard</h3>
            <p className="text-white/80 mb-1">Your ranking</p>
            <p className="text-sm text-white/60">Check your position</p>
          </div>

          {/* Edit Profile */}
          <div 
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 hover:shadow-xl transition-all duration-200 cursor-pointer text-white group" 
            onClick={() => navigate('/profile')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <FaUser className="w-6 h-6 text-white" />
              </div>
              <FaArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Edit Profile</h3>
            <p className="text-white/80 mb-1">Update your info</p>
            <p className="text-sm text-white/60">Keep profile updated</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Dashboard;

