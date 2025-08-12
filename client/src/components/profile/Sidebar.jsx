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
  FaEdit                  // Edit Profile
} from 'react-icons/fa';
import ProfileImage from '../common/ProfileImage';

const Sidebar = ({ 
  userData, 
  fullName, 
  activeTab, 
  setActiveTab, 
  earningsData, 
  purchasedCourses, 
  currency,
  sidebarOpen,
  setSidebarOpen 
}) => {
const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { id: 'earnings', label: 'Earnings', icon: <FaDollarSign /> },
  { id: 'referrals', label: 'Teams', icon: <FaUsers /> },
  { id: 'courses', label: 'My Courses', icon: <FaBook /> },
  { id: 'statements', label: 'Referral Earning', icon: <FaFileAlt /> },
  { id: 'purchase-history', label: 'Purchase History', icon: <FaShoppingCart /> },
  { id: 'leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
  { id: 'affiliated', label: 'Affilated Link', icon: <FaLink /> },
  { id: 'edit', label: 'Edit Profile', icon: <FaEdit /> },
];


  const ProfileHeader = ({ isDesktop = false }) => (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-pink-600">
      <div className={`flex items-center ${isDesktop ? 'space-x-4' : 'justify-between'}`}>
        <div className="flex items-center space-x-4">
          <div className="relative">
              <ProfileImage
                user={userData}
                size={isDesktop ? 'lg' : 'md'}
                className="border-4 border-white/30"
                showVerificationBadge={true}
              />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`font-bold text-white ${isDesktop ? 'text-lg' : 'text-base'} truncate flex items-center`}>
              {fullName}
              <svg className="w-4 h-4 text-blue-400 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </h2>
            {isDesktop && (
              <div className="flex items-center mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs text-white font-medium">
                  {userData.isAdmin ? '👑 Admin' : ' Packages'}
                </span>
              </div>
            )}
          </div>
        </div>
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(false)}
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

  const Navigation = ({ isMobile = false }) => (
    <nav className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
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
          <div className="text-lg font-bold text-green-600">
            <AnimatedNumber 
              value={earningsData.lifetime} 
              currency={currency} 
              decimals={0}
              duration={2000}
              delay={300}
            />
          </div>
          <div className="text-xs text-gray-600">Total Earned</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-lg font-bold text-blue-600">
            <AnimatedNumber 
              value={purchasedCourses.length} 
              decimals={0}
              duration={1500}
              delay={500}
            />
          </div>
          <div className="text-xs text-gray-600">Courses</div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 xl:w-80 bg-white shadow-xl h-screen sticky top-0 border-r border-gray-200">
        <ProfileHeader isDesktop={true} />
        <Navigation />
        <QuickStats />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 lg:hidden sidebar-slide ${sidebarOpen ? 'open' : ''}`}>
        <ProfileHeader isDesktop={false} />
        <Navigation isMobile={true} />
        <QuickStats />
      </div>
    </>
  );
};

export default Sidebar;