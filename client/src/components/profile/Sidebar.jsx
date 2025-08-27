import React from 'react';
import { assets } from '../../assets/assets';
import AnimatedNumber from '../common/AnimatedNumber';
import { 
  FaTachometerAlt,        // Dashboard
  FaDollarSign,           // Earnings
  FaMoneyBillWave,        // Withdrawal
  FaUsers,                // Teams (Referrals)
  FaBook,                 // My Courses
  FaFileAlt,              // Referral Earning (Statements)
  FaShoppingCart,         // Purchase History
  FaTrophy,               // Leaderboard
  FaLink,                 // Affilated Link
  FaEdit,                // Edit Profile
  FaUserCircle,           // Profile Icon
  FaShieldAlt             // KYC Verification
} from 'react-icons/fa';

const ProfileHeader = ({ onCloseMobile, isMobile, userData }) => (
  <div className="p-4 bg-gradient-to-r from-rose-500 to-pink-600">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-white text-3xl">
          {userData?.imageUrl ? (
            <img 
              src={userData.imageUrl} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <FaUserCircle />
          )}
        </div>
        <h2 className="text-white font-medium">Profile</h2>
      </div>
      {isMobile && (
        <button 
          onClick={onCloseMobile}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  </div>
);

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  earningsData, 
  purchasedCourses, 
  currency,
  sidebarOpen,
  setSidebarOpen,
  userData
}) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt />, color: 'from-blue-500 to-blue-600' },
    { id: 'earnings', label: 'Earnings', icon: <FaDollarSign />, color: 'from-green-500 to-green-600' },
    { id: 'withdrawal', label: 'Withdrawal', icon: <FaMoneyBillWave />, color: 'from-rose-500 to-pink-500' },
    { id: 'referrals', label: 'My Team', icon: <FaUsers />, color: 'from-purple-500 to-purple-600' },
    { id: 'kyc', label: 'KYC Verification', icon: <FaShieldAlt />, color: 'from-emerald-500 to-emerald-600' },
    { id: 'courses', label: 'My Packages', icon: <FaBook />, color: 'from-indigo-500 to-indigo-600' },
    { id: 'statements', label: 'Referral Earning', icon: <FaFileAlt />, color: 'from-orange-500 to-orange-600' },
    { id: 'purchase-history', label: 'Purchase History', icon: <FaShoppingCart />, color: 'from-teal-500 to-teal-600' },
    { id: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy />, color: 'from-yellow-500 to-yellow-600' },
    { id: 'affiliated', label: 'Affilated Link', icon: <FaLink />, color: 'from-cyan-500 to-cyan-600' },
    { id: 'edit', label: 'Edit Profile', icon: <FaEdit />, color: 'from-gray-500 to-gray-600' },
  ];

  const Navigation = ({ isMobile = false }) => (
    <nav className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile) setSidebarOpen(false);
            }}
            className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            
            {/* KYC Status Indicator */}
            {item.id === 'kyc' && (
              <div className="ml-auto flex items-center space-x-2">
                {userData?.kycStatus === 'verified' ? (
                  <span className="text-green-500 text-xs font-medium">✓ Verified</span>
                ) : userData?.kycStatus === 'pending' ? (
                  <span className="text-yellow-500 text-xs font-medium">⏳ Pending</span>
                ) : (
                  <span className="text-red-500 text-xs font-medium">⚠ Required</span>
                )}
              </div>
            )}
            
            {activeTab === item.id && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );

  const QuickStats = () => (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            <AnimatedNumber 
              value={earningsData?.lifetime || 0} 
              currency={currency} 
              duration={1500} 
              delay={200} 
            />
          </div>
          <div className="text-xs text-gray-600">Total Earned</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            <AnimatedNumber 
              value={purchasedCourses?.length || 0} 
              duration={1500} 
              delay={400} 
            />
          </div>
          <div className="text-xs text-gray-600">Packages</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 xl:w-80 bg-white shadow-xl h-screen sticky top-0 border-r border-gray-200">
        <ProfileHeader isMobile={false} userData={userData} />
        <Navigation />
        <QuickStats />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 lg:hidden sidebar-slide ${sidebarOpen ? 'open' : ''}`}>
        <ProfileHeader 
          isMobile={true}
          onCloseMobile={() => setSidebarOpen(false)}
          userData={userData}
        />
        <Navigation isMobile={true} />
        <QuickStats />
      </div>
    </>
  );
};

export default Sidebar;