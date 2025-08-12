import React, { useContext } from 'react'
import { AppContext } from '../../context/AppContext'
import { NavLink } from 'react-router-dom'
import { FiHome, FiPlusSquare, FiBook, FiUsers, FiClipboard, FiCheckCircle } from 'react-icons/fi'

const Sidebar = () => {
  const { isEducator, pendingOrdersCount } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: <FiHome size={24} /> },
    { name: 'Add Course', path: '/educator/add-course', icon: <FiPlusSquare size={24} /> },
    { name: 'My Courses', path: '/educator/myCourse', icon: <FiBook size={24} /> },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: <FiUsers size={24} /> },
    { name: 'Pending Orders', path: '/educator/pending-orders', icon: <FiClipboard size={24} /> },
    { name: 'KYC Review', path: '/educator/kyc-review', icon: <FiCheckCircle size={24} /> }
  ]

  return isEducator && (
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
        </NavLink>
      ))}
    </div>
  )
}

export default Sidebar
