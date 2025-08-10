import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { navigate, userData, setUserData } = useContext(AppContext);
  console.log('User Data:', userData);
  const location = useLocation();

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const isCourseListPage = location.pathname.includes('/course-list');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData(null);
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
    navigate('/login');
  };

  // Close dropdowns if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setDesktopDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setMobileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onDesktopButtonClick = () => {
    setDesktopDropdownOpen((open) => !open);
  };

  const onMobileButtonClick = () => {
    setMobileDropdownOpen((open) => !open);
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? 'bg-white' : 'bg-red-200/70'
      }`}
    >
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt="logo"
        className="w-32 lg:w-40 cursor-pointer"
      />

      {/* Desktop View */}
      <div className="hidden md:flex items-center gap-5 text-gray-700">
        {userData ? (
          <>
            {/* Notification Bell */}
            <NotificationBell />
            
            <div className="relative" ref={desktopDropdownRef}>
              <button
                onClick={onDesktopButtonClick}
                className="flex items-center gap-2 focus:outline-none"
                aria-haspopup="true"
                aria-expanded={desktopDropdownOpen}
                type="button"
              >
                <img
                  src={userData.imageUrl || assets.user_icon}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{userData.firstName}</span>
              </button>

              {desktopDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-[9999]">
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopDropdownOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Home
                  </button>

                  {userData.isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopDropdownOpen(false);
                          navigate('/educator'); // Dashboard
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopDropdownOpen(false);
                          navigate('/my-enrollments');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        My Enrollments
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
            type="button"
          >
            Login
          </button>
        )}
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        {userData ? (
          <>
            {/* Notification Bell for Mobile */}
            <NotificationBell />
            
            <div className="relative" ref={mobileDropdownRef}>
              <button onClick={onMobileButtonClick} type="button">
                <img
                  src={userData.imageUrl || assets.user_icon}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {mobileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-[9999]">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileDropdownOpen(false);
                      navigate('/');
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Home
                  </button>

                  {userData.isAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDropdownOpen(false);
                          navigate('/educator'); // Dashboard
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Dashboard
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDropdownOpen(false);
                          navigate('/my-enrollments');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        My Enrollments
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Profile
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
            type="button"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
