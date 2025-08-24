import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom'
import { FiHome, FiPlusSquare, FiBook, FiUsers, FiClipboard, FiCheckCircle, FiDollarSign } from 'react-icons/fi'
import axios from 'axios'

const Sidebar = () => {
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
    { name: 'Dashboard', path: '/educator', icon: <FiHome size={24} /> },
            { name: 'Add Package', path: '/educator/add-package', icon: <FiPlusSquare size={24} /> },
        { name: 'My Packages', path: '/educator/myCourse', icon: <FiBook size={24} /> },
    { name: 'Student Enrolled', path: '/educator/student-Enrolled', icon: <FiUsers size={24} /> },
    { name: 'Pending Orders', path: '/educator/pending-orders', icon: <FiClipboard size={24} /> },
    { name: 'KYC Review', path: '/educator/kyc-review', icon: <FiCheckCircle size={24} /> },
    { name: 'Withdrawals', path: '/educator/withdrawal-management', icon: <FiDollarSign size={24} /> }
  ]

  // Sub-admin menu items (limited access)
  const subAdminMenuItems = [
    { name: 'Student Enrolled', path: '/educator/student-Enrolled', icon: <FiUsers size={24} /> },
    { name: 'Pending Orders', path: '/educator/pending-orders', icon: <FiClipboard size={24} /> },
    { name: 'KYC Review', path: '/educator/kyc-review', icon: <FiCheckCircle size={24} /> },
    { name: 'Withdrawals', path: '/educator/withdrawal-management', icon: <FiDollarSign size={24} /> }
  ]

  // Determine which menu items to show
  const menuItems = (isSubAdmin || userData?.role === 'subadmin') ? subAdminMenuItems : isEducator ? fullAdminMenuItems : []

  return (isEducator || isSubAdmin || userData?.role === 'subadmin') && (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500 py-2 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/educator'}
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 relative ${isActive ? 'bg-indigo-50 border-r-[6px] border-indigo-500/90' : 'hover:bg-gray-100/90 border-r-[6px] border-white hover:border-gray-100/90'}`
          }
        >
          {item.icon}
          <p className='md:block hidden text-center'>{item.name}</p>
          {item.name === 'Pending Orders' && pendingOrdersCount > 0 && (
            <span className='absolute -top-1 -right-1 md:relative md:top-0 md:right-0 md:ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {pendingOrdersCount}
            </span>
          )}
          {item.name === 'Withdrawals' && pendingWithdrawalsCount > 0 && (
            <span className='absolute -top-1 -right-1 md:relative md:top-0 md:right-0 md:ml-auto bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {pendingWithdrawalsCount}
            </span>
          )}
        </NavLink>
      ))}
    </div>
  )
}

export default Sidebar
