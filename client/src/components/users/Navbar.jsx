import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import SpikyVerificationBadge from '../common/SpikyVerificationBadge';
import axios from 'axios';

// Component to display latest enrolled package
const LatestPackageDisplay = ({ userData }) => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [latestCourse, setLatestCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData && !userData.isAdmin && !userData.isSubAdmin) {
      fetchLatestPackage();
    } else {
      setLoading(false);
    }
  }, [userData]);

  const fetchLatestPackage = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.purchasedCourses && data.purchasedCourses.length > 0) {
        setLatestCourse(data.purchasedCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching latest package:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-left">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">{userData.firstName}</span>
          {userData.kycStatus === 'verified' && (
            <div className="w-4 h-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-sm"
              >
                <defs>
                  <linearGradient id="blueGradientNav1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                  fill="url(#blueGradientNav1)"
                />
                <path
                  d="M35 52 L45 62 L70 38"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">Loading...</div>
      </div>
    );
  }

  // Show admin/sub-admin info
  if (userData.isAdmin || userData.isSubAdmin) {
    return (
      <div className="text-left">
        <div className="flex items-center space-x-1">
          <span className="text-sm font-medium text-gray-900">{userData.firstName}</span>
          {userData.kycStatus === 'verified' && (
            <div className="w-4 h-4 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-sm"
              >
                <defs>
                  <linearGradient id="blueGradientNav2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <path
                  d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                  fill="url(#blueGradientNav2)"
                />
                <path
                  d="M35 52 L45 62 L70 38"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {userData.isAdmin ? 'Administrator' : 'Sub-Administrator'}
        </div>
      </div>
    );
  }


  return (
    <div className="text-left">
      <div className="flex items-center space-x-1">
        <span className="text-sm font-medium text-gray-900">{userData.firstName}</span>
        {userData.kycStatus === 'verified' && (
          <div className="w-4 h-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-sm"
            >
              <defs>
                <linearGradient id="blueGradientNav3" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              <path
                d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                fill="url(#blueGradientNav3)"
              />
              <path
                d="M35 52 L45 62 L70 38"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
              <div className="text-xs text-gray-500">
          {latestCourse
            ? ` ${latestCourse.courseTitle?.substring(0, 15)}${latestCourse.courseTitle?.length > 15 ? '...' : ''}`
            : 'No packages yet'
          }
        </div>
    </div>
  );
};

const Navbar = () => {
  const { navigate, userData, clearAuthData, backendUrl, getToken } = useContext(AppContext);

  const location = useLocation();

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [latestCourse, setLatestCourse] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [hasApprovedCourses, setHasApprovedCourses] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isPackageListPage = location.pathname.includes('/packages-list');

  // Fetch latest course for regular users
  useEffect(() => {
    if (userData && !userData.isAdmin && !userData.isSubAdmin) {
      fetchLatestCourse();
    }
  }, [userData]);

  const fetchLatestCourse = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.purchasedCourses && data.purchasedCourses.length > 0) {
        setPurchasedCourses(data.purchasedCourses);
        setLatestCourse(data.purchasedCourses[0]);
        setHasApprovedCourses(true);
      } else {
        setPurchasedCourses([]);
        setLatestCourse(null);
        setHasApprovedCourses(false);
      }
    } catch (error) {
      console.error('Error fetching latest course:', error);
      setPurchasedCourses([]);
      setLatestCourse(null);
      setHasApprovedCourses(false);
    }
  };

  const handleLogout = () => {
    // Clear all authentication data using centralized function
    clearAuthData();
    
    // Close all dropdowns
    setDesktopDropdownOpen(false);
    setMobileDropdownOpen(false);
    setMobileMenuOpen(false);
    
    // Navigate to login page
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
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
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
    <nav className="bg-gradient-to-r from-rose-50 to-pink-50 shadow-lg border-b border-rose-100 sticky top-0 z-50 backdrop-blur-sm animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 px-2 sm:px-0">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              onClick={() => navigate('/')}
              src="/logo.png"
              alt="Growth Nepal Logo"
              className="w-24 sm:w-28 md:w-32 lg:w-40 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userData ? (
              <>
                {/* Navigation Links */}
                <button
                  onClick={() => navigate('/packages-list')}
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                >
                  Packages
                </button>



                {/* User Profile Dropdown */}
                <div className="relative" ref={desktopDropdownRef}>
                  <button
                    onClick={onDesktopButtonClick}
                    className="flex items-center space-x-3 bg-white/70 hover:bg-white/90 rounded-full px-3 py-2 transition-colors duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 shadow-sm"
                    aria-haspopup="true"
                    aria-expanded={desktopDropdownOpen}
                    type="button"
                  >
                    <div className="relative">
                      <img
                        src={userData.imageUrl || assets.user_icon}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-rose-200"
                      />
                      {/* Spiky KYC Verified Badge on Profile Picture */}
                      {userData.kycStatus === 'verified' && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            className="w-full h-full drop-shadow-lg"
                          >
                            <defs>
                              <linearGradient id="blueGradientNavProfile1" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M50 5 L61 15 L75 12 L82 25 L95 30 L92 45 L100 55 L92 65 L95 80 L82 85 L75 98 L61 95 L50 100 L39 95 L25 98 L18 85 L5 80 L8 65 L0 55 L8 45 L5 30 L18 25 L25 12 L39 15 Z"
                              fill="url(#blueGradientNavProfile1)"
                            />
                            <path
                              d="M35 52 L45 62 L70 38"
                              stroke="white"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <LatestPackageDisplay userData={userData} />
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {desktopDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] animate-slide-down">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={userData.imageUrl || assets.user_icon}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {userData.kycStatus === 'verified' && (
                              <div className="absolute -bottom-1 -right-1">
                                <SpikyVerificationBadge gradientId="blueGradientNavDropdown2" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <p className="text-sm font-medium text-gray-900">{userData.firstName} {userData.lastName}</p>
                              {userData.kycStatus === 'verified' && (
                                <SpikyVerificationBadge gradientId="blueGradientNavDropdownText1" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {userData.isAdmin ? 'Administrator' : userData.isSubAdmin ? 'Sub-Administrator' : (
                                latestCourse
                                  ? `${latestCourse.courseTitle?.substring(0, 25)}${latestCourse.courseTitle?.length > 25 ? '...' : ''}`
                                  : 'No packages yet'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Home
                        </button>

                        {userData.isAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDesktopDropdownOpen(false);
                              navigate('/educator');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </button>
                        ) : (userData.isSubAdmin || userData.role === 'subadmin') ? (
                          <button
                            type="button"
                            onClick={() => {
                              setDesktopDropdownOpen(false);
                              navigate('/educator/student-Enrolled');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Sub-Admin Panel
                          </button>
                        ) : null}

                        {/* Additional Navigation Options */}
                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/about-us');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          About Us
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/policy');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Privacy Policy
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/terms');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Terms & Conditions
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/refund');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Refund Policy
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/help');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Help Center
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/faq');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          FAQ
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDesktopDropdownOpen(false);
                            navigate('/contact');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Us
                        </button>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Only show Profile link for users with approved courses or admins */}
                        {(hasApprovedCourses || userData.isAdmin || userData.isSubAdmin) && (
                          <button
                            type="button"
                            onClick={() => {
                              setDesktopDropdownOpen(false);
                              navigate('/profile');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </button>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/about-us')}
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                >
                  About Us
                </button>
                <button
                  onClick={() => navigate('/packages-list')}
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                >
                  Packages
                </button>
                <button
                  onClick={() => navigate('/policy')}
                  className="text-gray-700 hover:text-rose-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:shadow-md"
                >
                  Policy
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                  type="button"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {userData ? (
              <>

                <div className="relative ml-1" ref={mobileDropdownRef}>
                  <button
                    onClick={onMobileButtonClick}
                    type="button"
                    className="flex items-center justify-center bg-white/70 hover:bg-white/90 rounded-full p-2 transition-colors duration-200 shadow-sm"
                  >
                    <div className="relative">
                      <img
                        src={userData.imageUrl || assets.user_icon}
                        alt="Profile"
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-rose-200"
                      />
                      {userData.kycStatus === 'verified' && (
                        <div className="absolute -bottom-1 -right-1">
                          <SpikyVerificationBadge size="w-3 h-3" gradientId="blueGradientNavMobile1" />
                        </div>
                      )}
                    </div>
                  </button>

                  {mobileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] animate-slide-down">
                      {/* Mobile User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <img
                              src={userData.imageUrl || assets.user_icon}
                              alt="Profile"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            {userData.kycStatus === 'verified' && (
                              <div className="absolute -bottom-1 -right-1">
                                <SpikyVerificationBadge gradientId="blueGradientNavMobile2" />
                              </div>
                            )}
                          </div>
                          <LatestPackageDisplay userData={userData} />
                        </div>
                      </div>

                      {/* Mobile Menu Items */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Home
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/packages-list');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Packages
                        </button>

                        {userData.isAdmin ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileDropdownOpen(false);
                              navigate('/educator');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Admin Dashboard
                          </button>
                        ) : (userData.isSubAdmin || userData.role === 'subadmin') ? (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileDropdownOpen(false);
                              navigate('/educator/student-Enrolled');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Sub-Admin Panel
                          </button>
                        ) : (
                          <>


                          </>
                        )}

                        {/* Additional Navigation Options */}
                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/about-us');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          About Us
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/policy');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Privacy Policy
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/terms-conditions');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Terms & Conditions
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/refund-policy');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          Refund Policy
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/faq');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          FAQ
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMobileDropdownOpen(false);
                            navigate('/contact-us');
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Us
                        </button>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-1"></div>

                        {/* Only show Profile link for users with approved courses or admins */}
                        {(hasApprovedCourses || userData.isAdmin || userData.isSubAdmin) && (
                          <button
                            type="button"
                            onClick={() => {
                              setMobileDropdownOpen(false);
                              navigate('/profile');
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:translate-x-1 transform"
                          >
                            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile
                          </button>
                        )}
                      </div>

                      {/* Mobile Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/login')}
                  className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
                  type="button"
                >
                  Sign In
                </button>
                
                {/* Hamburger Menu Button */}
                <div className="relative" ref={mobileMenuRef}>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-white/70 hover:bg-white/90 rounded-lg p-2 transition-colors duration-200 shadow-sm"
                    type="button"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Mobile Menu Dropdown */}
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999] animate-slide-down">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/about-us');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        About Us
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/packages-list');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Packages
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/policy');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Policy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;