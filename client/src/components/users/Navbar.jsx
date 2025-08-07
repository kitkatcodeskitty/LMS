import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const Navbar = () => {
  const { navigate, isEducator, userData } = useContext(AppContext);
  const location = useLocation();

  const isCourseListPage = location.pathname.includes('/course-list');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); 
  };

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' : 'bg-red-200/70'}`}>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='logo'
        className='w-3/12 lg:w-2/12 cursor-pointer'
      />

      {/* Desktop View */}
      <div className='hidden md:flex items-center gap-5 text-gray500'>
        <div className='flex items-center gap-5'>
          {userData && (
            <>
              <button onClick={() => navigate('/educator')}>
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              |
              <Link to='/my-enrollments'>My Enrollments</Link>
            </>
          )}
        </div>

        {userData ? (
          <button
            onClick={handleLogout}
            className='bg-red-600 text-white px-4 py-1 rounded-full'
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className='bg-blue-600 text-white px-5 py-2 rounded-full'
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile View */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap max-sm:text-xs'>
          {userData && (
            <>
              <button onClick={() => navigate('/educator')}>
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              |
              <Link to='/my-enrollments'>My Enrollments</Link>
            </>
          )}
        </div>

        {userData ? (
          <button onClick={handleLogout}>
            <img src={assets.user_icon} alt='logout' />
          </button>
        ) : (
          <button onClick={() => navigate('/login')}>
            <img src={assets.user_icon} alt='login' />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
