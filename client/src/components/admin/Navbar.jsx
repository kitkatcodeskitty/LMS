import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const { userData, isEducator, isSubAdmin } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); 
  };

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 '>
      <Link to="/">
        <img
          src={assets.logo}
          alt="Logo"
          className="w-24 cursor-pointer" 
        />
      </Link>

      <div className='flex items-center gap-5 text-gray-500 relative'>
        <div className="flex items-center gap-2">
          <p>Hi! {userData ? userData.firstName : 'Developer'}</p>
          {isEducator && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
              Admin
            </span>
          )}
          {(isSubAdmin || userData?.role === 'subadmin') && !isEducator && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              Sub-Admin
            </span>
          )}
        </div>

        {userData ? (
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <Link to="/login">
            <img
              className='w-8 h-8 rounded-full'
              src={assets.profile_img}
              alt='Default profile'
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
