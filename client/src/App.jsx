import React, { useContext } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

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

const App = () => {
  const { userData } = useContext(AppContext);
  const location = useLocation();

  // Hide Navbar on /educator and its subroutes
  const showNavbar = !location.pathname.startsWith('/educator');

  return (
    <div className="text-default min-h-screen bg-white">

      <ScrollToTop /> {/* Scrolls to top on route change */}

      {showNavbar && <Navbar />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
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
        <Route path="/profile" element={<Profile />} />

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
