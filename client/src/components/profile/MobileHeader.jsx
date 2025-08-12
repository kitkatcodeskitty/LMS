import React from 'react';
import { assets } from '../../assets/assets';

const MobileHeader = ({ userData, activeTab, sidebarItems, setSidebarOpen }) => {
  return (
    <div className="lg:hidden glass-effect sticky top-0 z-30 border-b border-gray-200/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-white/80 hover:bg-white shadow-sm transition-colors"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-gray-600">Profile Dashboard</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <img
            src={userData.imageUrl || assets.user_icon}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileHeader;