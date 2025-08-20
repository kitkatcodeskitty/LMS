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
  FaFire
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
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { 
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.1);
        }
        50% { 
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(236, 72, 153, 0.2);
        }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes fadeInScale {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes rotate-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes bounce-gentle {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-shimmer {
        animation: shimmer 3s linear infinite;
      }
      
      .animate-pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .animate-slide-in-up {
        animation: slideInUp 0.8s ease-out forwards;
      }
      
      .animate-fade-in-scale {
        animation: fadeInScale 0.6s ease-out forwards;
      }
      
      .animate-rotate-slow {
        animation: rotate-slow 20s linear infinite;
      }
      
      .animate-bounce-gentle {
        animation: bounce-gentle 4s ease-in-out infinite;
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .gradient-border {
        background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
        background-size: 400% 400%;
        animation: gradient-shift 4s ease infinite;
      }
      
      @keyframes gradient-shift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      .card-hover {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .card-hover:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.3);
      }
      
      .gradient-text {
        background: linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        background-size: 300% 300%;
        animation: gradient-shift 4s ease infinite;
      }
      
      .gradient-text-orange {
        background: linear-gradient(135deg, #f59e0b, #ea580c, #dc2626);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-text-blue {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8, #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-text-green {
        background: linear-gradient(135deg, #10b981, #059669, #047857);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-text-purple {
        background: linear-gradient(135deg, #8b5cf6, #7c3aed, #6d28d9);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .gradient-text-orange-wallet {
        background: linear-gradient(135deg, #f97316, #ea580c, #dc2626);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .neon-glow {
        box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(236, 72, 153, 0.1);
      }
      
      .neon-glow:hover {
        box-shadow: 0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(236, 72, 153, 0.2);
      }
      
      .floating-elements {
        animation: float 8s ease-in-out infinite;
      }
      
      .floating-elements:nth-child(2) {
        animation-delay: 2s;
      }
      
      .floating-elements:nth-child(3) {
        animation-delay: 4s;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-rotate-slow"></div>
      </div>

      {/* Top Header Section - Enhanced User Profile */}
      <div className="mb-10 relative z-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full -translate-y-20 translate-x-20 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full translate-y-16 -translate-x-16 animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-orange-400 to-red-400 rounded-full animate-bounce-gentle"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              {/* Enhanced Profile Image */}
              <div className="relative">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full p-1 animate-pulse-glow">
                    <img
                      src={userData.imageUrl || '/default-avatar.png'}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-white/20 shadow-2xl"
                    />
                  </div>
                  {userData.kycStatus === 'verified' && (
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg animate-pulse-glow">
                      <FaShieldAlt className="w-5 h-5 text-white" />
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center border-4 border-white/20 shadow-lg animate-bounce-gentle">
                    <FaStar className="w-6 h-6 text-white" />
                  </div>
                  {/* Floating Sparkles */}
                  <div className="absolute top-0 right-0 w-6 h-6 text-pink-400 animate-rotate-slow">
                    <FaStar className="w-full h-full" />
                  </div>
                </div>
              </div>

              {/* Enhanced User Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4 animate-fade-in-scale">
                  {fullName || 'Welcome!'}
                </h1>
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 px-6 py-3 rounded-2xl border border-pink-500/30 mb-4 backdrop-blur-sm">
                  <FaGem className="w-6 h-6 text-pink-400" />
                  <p className="text-xl text-white font-semibold">
                    PACKAGE: {purchasedCourses.length > 0 ? 
                      (purchasedCourses[0].courseTitle || 'SUPREME') : 
                      'SUPREME'
                    }
                  </p>
                </div>
                {userData.isAdmin && (
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-2xl border border-yellow-500/30 backdrop-blur-sm">
                    <FaCrown className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-300">Administrator</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout - Enhanced Visual Design */}
      <div className="space-y-8 relative z-10">
        {/* Top Row - Enhanced Earnings Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Last 7 Days Earning */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaDollarSign className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text-blue mb-2">
                <AnimatedNumber 
                  value={earningsData.lastSevenDays || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={400} 
                />/-
              </div>
              <div className="text-sm text-gray-300 mb-3">Last 7 Days</div>
              <div className="w-full bg-blue-900/30 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-400 to-cyan-400 h-3 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: '25%' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* All Time Earning */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaChartBar className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text-green mb-2">
                <AnimatedNumber 
                  value={earningsData.lifetime || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={500} 
                />/-
              </div>
              <div className="text-sm text-gray-300 mb-3">All Time</div>
              <div className="w-full bg-emerald-900/30 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-3 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: '75%' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Last 30 Days Earning */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaCalendarAlt className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text-purple mb-2">
                <AnimatedNumber 
                  value={earningsData.thisMonth || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={600} 
                />/-
              </div>
              <div className="text-sm text-gray-300 mb-3">Last 30 Days</div>
              <div className="w-full bg-purple-900/30 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: '15%' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FaWallet className="w-8 h-8 text-white" />
              </div>
              <div className="text-2xl font-bold gradient-text-orange-wallet mb-2">
                <AnimatedNumber
                  value={earningsData.currentBalance || 0} 
                  currency="₹ " 
                  duration={2000} 
                  delay={700} 
                />/-
              </div>
              <div className="text-sm text-gray-300 mb-3">Wallet</div>
              <div className="w-full bg-orange-900/30 rounded-full h-3 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-1000 relative overflow-hidden" style={{ width: '5%' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Enhanced 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Enhanced Today's Earning Card */}
          <div className="lg:col-span-1 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl p-8 shadow-2xl border border-pink-500/30 backdrop-blur-xl card-hover h-full">
              {/* Enhanced Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full -translate-y-16 translate-x-16 animate-float"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full translate-y-12 -translate-x-12 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full animate-bounce-gentle"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
                    <FaCoins className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}>
                    <FaPiggyBank className="w-4 h-4 text-white" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '1s' }}>
                    <FaArrowUp className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center animate-float">
                    <FaStar className="w-3 h-3 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl font-bold text-white mb-4">Today's Earning</h2>
                <div className="text-5xl font-bold gradient-text-orange mb-4">
                  <AnimatedNumber 
                    value={earningsData.today || 0} 
                    currency="₹ " 
                    duration={2000} 
                    delay={300} 
                  />/-
                </div>
                <p className="text-lg text-gray-300">Track your daily earnings progress</p>
                
                {/* Floating Fire Icon */}
                <div className="absolute top-4 right-4 text-orange-400 animate-bounce-gentle">
                  <FaFire className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Enhanced Quick Actions & Wallet */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Quick Actions Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Get started quickly</h3>
                    <p className="text-gray-400 text-sm">Choose your next action</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                    <FaBolt className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/packages-list')}
                    className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 group-hover:scale-105"
                  >
                    <FaGraduationCap className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Browse Packages</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('referrals')}
                    className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 group-hover:scale-105"
                  >
                    <FaUsers className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">View Referrals</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('edit')}
                    className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-2 group-hover:scale-105"
                  >
                    <FaEdit className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Wallet Balance Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative overflow-hidden bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl p-6 shadow-2xl border border-pink-500/30 backdrop-blur-xl card-hover">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full -translate-y-12 translate-x-12 animate-float"></div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse-glow">
                    <FaWallet className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">Wallet Balance</h3>
                  <div className="text-3xl font-bold gradient-text-orange-wallet mb-4">
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
                    className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-2 text-base"
                  >
                    Withdraw Funds
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Enhanced Additional Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Free Trip Progress Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-600/20 rounded-3xl p-8 shadow-2xl border border-blue-500/30 backdrop-blur-xl card-hover">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full translate-y-16 -translate-x-16 animate-float"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full -translate-y-10 translate-x-10 animate-float" style={{ animationDelay: '2s' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mr-5 shadow-lg animate-pulse-glow">
                    <FaPlane className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Free Trip Target</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-lg font-medium text-gray-300">
                    <span>Achieved: {referralData.length}</span>
                    <span>Target: 25</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-blue-900/30 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 h-4 rounded-full transition-all duration-1000 relative overflow-hidden"
                        style={{ width: `${freeTripProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    {referralData.length >= 25 ? (
                      <span className="flex items-center justify-center text-emerald-400 font-semibold text-lg">
                        <FaTrophy className="w-6 h-6 mr-3 text-yellow-400" />
                        Target Achieved! 🎉
                      </span>
                    ) : (
                      <span className="text-gray-300 text-lg">
                        {25 - referralData.length} more referrals needed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Performance Insights Card */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 backdrop-blur-xl card-hover">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse-glow">
                  <FaChartLine className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Performance Insights</h3>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl p-4 border border-emerald-500/30">
                    <div className="text-3xl font-bold gradient-text-green mb-2">
                      {referralData.length}
                    </div>
                    <div className="text-sm text-gray-300">Total Referrals</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-4 border border-blue-500/30">
                    <div className="text-3xl font-bold gradient-text-blue mb-2">
                      {purchasedCourses.length}
                    </div>
                    <div className="text-sm text-gray-300">Active Packages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
