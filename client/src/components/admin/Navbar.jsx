import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const { userData, isEducator, isSubAdmin, clearAuthData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all authentication data using centralized function
    clearAuthData();
    
    // Reload the page to clear all context
    window.location.reload(); 
  };

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 '>
      <Link to="/">
        <img
          src="/logo.png"
          alt="Growth Nepal Logo"
          className="w-24 cursor-pointer" 
        />
      </Link>

      <div className='flex items-center gap-5 text-gray-500 relative'>
        {userData && (
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
