import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom'
import {
  FiHome,
  FiPlusSquare,
  FiBook,
  FiUsers,
  FiClipboard,
  FiCheckCircle,
  FiDollarSign,
  FiImage,
  FiShield
} from 'react-icons/fi'
import { FaUserCircle } from 'react-icons/fa'
import axios from 'axios'

const ProfileHeader = ({ onCloseMobile, isMobile, userData, isEducator }) => (
  <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600">
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
        <div>
          <h2 className="text-white font-medium">Admin Panel</h2>
          <p className="text-white/80 text-sm">{isEducator ? 'Full Access' : 'Limited Access'}</p>
        </div>
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
)

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { isEducator, isSubAdmin, userData, pendingOrdersCount, backendUrl, getToken } = useContext(AppContext)
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState(0)

  // Fetch pending withdrawals count
  const fetchPendingWithdrawalsCount = async () => {
    try {
      const token = getToken();
      if (!token || (!isEducator && !isSubAdmin && userData?.role !== 'subadmin')) return;

      const { data } = await axios.get(`${backendUrl}/api/admin/withdrawals/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setPendingWithdrawalsCount(data.data.pagination.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching pending withdrawals count:', error);
    }
  };

  // Fetch count on component mount and set up polling
  useEffect(() => {
    if (isEducator || isSubAdmin || userData?.role === 'subadmin') {
      fetchPendingWithdrawalsCount();

      // Poll every 30 seconds for new withdrawals
      const interval = setInterval(fetchPendingWithdrawalsCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isEducator, isSubAdmin, userData, backendUrl, getToken]);

  // Full admin menu items
  const fullAdminMenuItems = [
    { name: 'Dashboard', path: '/educator', icon: <FiHome />, color: 'from-blue-500 to-blue-600' },
    { name: 'Add Package', path: '/educator/add-package', icon: <FiPlusSquare />, color: 'from-green-500 to-green-600' },
    { name: 'My Packages', path: '/educator/myCourse', icon: <FiBook />, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Student Enrolled', path: '/educator/student-Enrolled', icon: <FiUsers />, color: 'from-purple-500 to-purple-600' },
    { name: 'Pending Orders', path: '/educator/pending-orders', icon: <FiClipboard />, color: 'from-orange-500 to-orange-600' },
    { name: 'KYC Review', path: '/educator/kyc-review', icon: <FiCheckCircle />, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Withdrawals', path: '/educator/withdrawal-management', icon: <FiDollarSign />, color: 'from-rose-500 to-pink-500' },
    { name: 'Popup Management', path: '/educator/popup-management', icon: <FiImage />, color: 'from-cyan-500 to-cyan-600' }
  ]

  // Sub-admin menu items (limited access)
  const subAdminMenuItems = [
    { name: 'Student Enrolled', path: '/educator/student-Enrolled', icon: <FiUsers />, color: 'from-purple-500 to-purple-600' },
    { name: 'Pending Orders', path: '/educator/pending-orders', icon: <FiClipboard />, color: 'from-orange-500 to-orange-600' },
    { name: 'KYC Review', path: '/educator/kyc-review', icon: <FiCheckCircle />, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Withdrawals', path: '/educator/withdrawal-management', icon: <FiDollarSign />, color: 'from-rose-500 to-pink-500' },
    { name: 'Popup Management', path: '/educator/popup-management', icon: <FiImage />, color: 'from-cyan-500 to-cyan-600' }
  ]

  // Determine which menu items to show
  const menuItems = (isSubAdmin || userData?.role === 'subadmin') ? subAdminMenuItems : isEducator ? fullAdminMenuItems : []

  const Navigation = ({ isMobile = false }) => (
    <nav className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/educator'}
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
            }}
            className={({ isActive }) =>
              `w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 text-left relative ${isActive
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
              }`
            }
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <span className="font-medium">{item.name}</span>

            {/* Notification badges */}
            {item.name === 'Pending Orders' && pendingOrdersCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </span>
            )}
            {item.name === 'Withdrawals' && pendingWithdrawalsCount > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {pendingWithdrawalsCount > 99 ? '99+' : pendingWithdrawalsCount}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )

  const QuickStats = () => (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">
            {pendingOrdersCount || 0}
          </div>
          <div className="text-xs text-gray-600">Pending Orders</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {pendingWithdrawalsCount || 0}
          </div>
          <div className="text-xs text-gray-600">Withdrawals</div>
        </div>
      </div>
    </div>
  )

  if (!isEducator && !isSubAdmin && userData?.role !== 'subadmin') {
    return null
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 xl:w-80 bg-white shadow-xl h-screen sticky top-0 border-r border-gray-200">
        <ProfileHeader isMobile={false} userData={userData} isEducator={isEducator} />
        <Navigation />
        <QuickStats />
      </div>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 lg:hidden sidebar-slide ${sidebarOpen ? 'open' : ''}`}>
        <ProfileHeader
          isMobile={true}
          onCloseMobile={() => setSidebarOpen(false)}
          userData={userData}
          isEducator={isEducator}
        />
        <Navigation isMobile={true} />
        <QuickStats />
      </div>
    </>
  )
}

export default Sidebar
