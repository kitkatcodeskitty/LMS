import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); 
  };

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3 '>
      <Link to='/'>
        <img src={assets.logo} alt='Logo' className='w-2/12 lg:w-23 cursor-pointer' />
      </Link>

      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p>Hi! {userData ? userData.firstName : 'Developer'}</p>

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
