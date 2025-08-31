import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/admin/Navbar'
import Sidebar from '../../components/admin/Sidebar'
import Footer from '../../components/admin/Footer'
import { FiMenu } from 'react-icons/fi'

const Educator = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className='text-default min-h-screen bg-gray-50'>
      <Navbar />
      
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Admin Panel
          </h1>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className='flex min-h-screen'>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className='flex-1 flex flex-col lg:ml-0'>
           <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Educator