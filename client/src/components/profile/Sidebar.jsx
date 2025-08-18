import React from 'react';
import { assets } from '../../assets/assets';
import AnimatedNumber from '../common/AnimatedNumber';
import { 
  FaTachometerAlt,        // Dashboard
  FaDollarSign,           // Earnings
  FaUsers,                // Teams (Referrals)
  FaBook,                 // My Courses
  FaFileAlt,              // Referral Earning (Statements)
  FaShoppingCart,         // Purchase History
  FaTrophy,               // Leaderboard
  FaLink,                 // Affilated Link
  FaEdit,                // Edit Profile
  FaUserCircle           // Profile Icon
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
    { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { id: 'earnings', label: 'Earnings', icon: <FaDollarSign /> },
    { id: 'referrals', label: 'Teams', icon: <FaUsers /> },
    { id: 'courses', label: 'My Packages', icon: <FaBook /> },
    { id: 'statements', label: 'Referral Earning', icon: <FaFileAlt /> },
    { id: 'purchase-history', label: 'Purchase History', icon: <FaShoppingCart /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
    { id: 'affiliated', label: 'Affilated Link', icon: <FaLink /> },
    { id: 'edit', label: 'Edit Profile', icon: <FaEdit /> },
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