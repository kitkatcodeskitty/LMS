import React, { useContext, useState, useEffect } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import Home from './pages/users/Home';
import CoursesList from './pages/users/CourseList';
import CourseDetails from './pages/users/CourseDetails';
import MyEnrollments from './pages/users/MyEnrollments';
import Player from './pages/users/Player';
import Payment from './pages/users/Payment';
import EnhancedPayment from './pages/users/EnhancedPayment';
import Loading from './components/users/Loading';

import AddCourse from './pages/admin/AddCourse';
import Dashboard from './pages/admin/Dashboard';
import Educator from './pages/admin/Educator';
import MyCourse from './pages/admin/MyCourse';
import StudentsEnrolled from './pages/admin/StudentsEnrolled';
import KycReview from './pages/admin/KycReview';
import PendingOrders from './pages/admin/PendingOrders';
import WithdrawalManagement from './pages/admin/WithdrawalManagement';
import PopupManagement from './pages/admin/PopupManagement';

import Navbar from './components/users/Navbar';
import 'quill/dist/quill.snow.css';


import Register from './pages/users/Registration';
import Login from './pages/users/Login';
import Kyc from './pages/users/Kyc';
import Referral from './pages/users/Referral';
import Profile from './pages/users/Profile';
import AboutUs from './pages/users/AboutUs';
import Policy from './pages/users/Policy';
import Help from './pages/users/Help';
import FAQ from './pages/users/FAQ';
import Terms from './pages/users/Terms';
import Refund from './pages/users/Refund';
import Contact from './pages/users/Contact';

import ScrollToTop from './components/common/ScrollToTop'; // ScrollToTop import

import { AppContext } from './context/AppContext';

// Protected Profile Route - only allows users with approved courses
const ProtectedProfileRoute = () => {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const [hasApprovedCourses, setHasApprovedCourses] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserCourses();
  }, [userData]);

  const checkUserCourses = async () => {
    if (!userData) {
      setIsLoading(false);
      return;
    }

    if (userData.isAdmin || userData.isSubAdmin) {
      // Admins and sub-admins always have access
      setHasApprovedCourses(true);
      setIsLoading(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        setHasApprovedCourses(false);
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.purchasedCourses && data.purchasedCourses.length > 0) {
        setHasApprovedCourses(true);
      } else {
        setHasApprovedCourses(false);
      }
    } catch (error) {
      console.error('Error checking user courses:', error);
      setHasApprovedCourses(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (hasApprovedCourses === false) {
    return <Navigate to="/" replace />;
  }

  return <Profile />;
};

// Conditional Home Component - redirects based on user type
const ConditionalHome = () => {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApprovedCourses, setHasApprovedCourses] = useState(false);
  const [checkingCourses, setCheckingCourses] = useState(false);

  useEffect(() => {
    // Check if there's a token (user is logged in)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (token && userData) {
      // User is logged in and data is loaded
      // Check if this is a direct URL entry (not from navigation)
      const isDirectEntry = !sessionStorage.getItem('navigated');
      
      if (isDirectEntry) {
        // Check if user has approved courses before redirecting
        checkUserCourses();
      } else {
        setShouldRedirect(false);
        setIsLoading(false);
      }
    } else if (!token) {
      // No token, user is not logged in
      setIsLoading(false);
    }
    // If there's a token but no userData yet, keep loading
  }, [userData]);

  const checkUserCourses = async () => {
    if (!userData || userData.isAdmin || userData.isSubAdmin) {
      // Admins and sub-admins always have access to profile
      setHasApprovedCourses(true);
      setShouldRedirect(true);
      setIsLoading(false);
      return;
    }

    setCheckingCourses(true);
    try {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success && data.purchasedCourses && data.purchasedCourses.length > 0) {
        setHasApprovedCourses(true);
        setShouldRedirect(true);
      } else {
        setHasApprovedCourses(false);
        setShouldRedirect(false);
      }
    } catch (error) {
      console.error('Error checking user courses:', error);
      setHasApprovedCourses(false);
      setShouldRedirect(false);
    } finally {
      setCheckingCourses(false);
      setIsLoading(false);
    }
  };

  // Debug logging
  console.log('ConditionalHome Debug:', {
    userData: !!userData,
    shouldRedirect,
    isLoading,
    checkingCourses,
    hasApprovedCourses,
    token: !!(localStorage.getItem('token') || sessionStorage.getItem('token')),
    navigated: !!sessionStorage.getItem('navigated')
  });

  if (isLoading || checkingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user is logged in, has approved courses, and this is a direct entry, redirect to profile dashboard
  if (userData && shouldRedirect && hasApprovedCourses) {
    console.log('Redirecting to profile dashboard - user has approved courses');
    sessionStorage.setItem('navigated', 'true');
    return <Navigate to="/profile" replace />;
  }

  // For non-logged in users, users without approved courses, and navigation within app - show homepage
  console.log('Showing homepage');
  return <Home />;
};

const App = () => {
  const { userData } = useContext(AppContext);
  const location = useLocation();

  // Hide Navbar on /educator and its subroutes
  const showNavbar = !location.pathname.startsWith('/educator');

  return (
    <div className="text-default min-h-screen bg-white">

      <ScrollToTop /> 

      {showNavbar && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<ConditionalHome />} />
        <Route path="/packages-list" element={<CoursesList />} />
        <Route path="/packages-list/:input" element={<CoursesList />} />
        <Route path="/package/:id" element={<CourseDetails />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment/:courseId" element={<EnhancedPayment />} />
        <Route path="/kyc" element={<Kyc />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<ProtectedProfileRoute />} />

        {/* Admin-only routes */}
        <Route
          path="/educator"
          element={
            (userData?.isAdmin || userData?.isSubAdmin || userData?.role === 'subadmin') ? <Educator /> : <Navigate to="/" replace />
          }
        >
          <Route index element={<Dashboard />} />
                  <Route path="myCourse" element={<MyCourse />} />
        <Route path="add-package" element={<AddCourse />} />
          <Route path="student-Enrolled" element={<StudentsEnrolled />} />
          <Route path="pending-orders" element={<PendingOrders />} />
          <Route path="kyc-review" element={<KycReview />} />
          <Route path="withdrawal-management" element={<WithdrawalManagement />} />
          <Route path="popup-management" element={<PopupManagement />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
