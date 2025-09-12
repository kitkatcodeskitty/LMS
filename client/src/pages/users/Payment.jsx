import React from 'react';
import { useLocation } from 'react-router-dom';
import EnhancedPayment from './EnhancedPayment';

const PaymentPage = () => {
  const location = useLocation();
  
  // Extract course data from location state and pass it to EnhancedPayment
  const { courseId, courseTitle, coursePrice, currency, referralCode } = location.state || {};
  
  // If no course data, redirect to packages list
  if (!courseId || !courseTitle || coursePrice == null) {
    return <EnhancedPayment />;
  }

  // Pass the course data as props to EnhancedPayment
  return <EnhancedPayment courseData={{ courseId, courseTitle, coursePrice, currency, referralCode }} />;
};

export default PaymentPage;