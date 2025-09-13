import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Lazy loading wrapper for better performance
const LazyWrapper = ({ 
  component: Component, 
  fallback = <LoadingSpinner />,
  ...props 
}) => {
  return (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-configured lazy components for common pages
export const LazyHome = lazy(() => import('../../pages/users/Home'));
export const LazyCoursesList = lazy(() => import('../../pages/users/CourseList'));
export const LazyCourseDetails = lazy(() => import('../../pages/users/CourseDetails'));
export const LazyPlayer = lazy(() => import('../../pages/users/Player'));
export const LazyPayment = lazy(() => import('../../pages/users/Payment'));
export const LazyEnhancedPayment = lazy(() => import('../../pages/users/EnhancedPayment'));
export const LazyRegister = lazy(() => import('../../pages/users/Registration'));
export const LazyLogin = lazy(() => import('../../pages/users/Login'));
export const LazyKyc = lazy(() => import('../../pages/users/Kyc'));
export const LazyReferral = lazy(() => import('../../pages/users/Referral'));
export const LazyProfile = lazy(() => import('../../pages/users/Profile'));
export const LazyAboutUs = lazy(() => import('../../pages/users/AboutUs'));
export const LazyPolicy = lazy(() => import('../../pages/users/Policy'));
export const LazyHelp = lazy(() => import('../../pages/users/Help'));
export const LazyFAQ = lazy(() => import('../../pages/users/FAQ'));
export const LazyTerms = lazy(() => import('../../pages/users/Terms'));
export const LazyRefund = lazy(() => import('../../pages/users/Refund'));
export const LazyContact = lazy(() => import('../../pages/users/Contact'));

// Admin components
export const LazyDashboard = lazy(() => import('../../pages/admin/Dashboard'));
export const LazyEducator = lazy(() => import('../../pages/admin/Educator'));
export const LazyMyCourse = lazy(() => import('../../pages/admin/MyCourse'));
export const LazyAddCourse = lazy(() => import('../../pages/admin/AddCourse'));
export const LazyStudentsEnrolled = lazy(() => import('../../pages/admin/StudentsEnrolled'));
export const LazyKycReview = lazy(() => import('../../pages/admin/KycReview'));
export const LazyPendingOrders = lazy(() => import('../../pages/admin/PendingOrders'));
export const LazyWithdrawalManagement = lazy(() => import('../../pages/admin/WithdrawalManagement'));
export const LazyPopupManagement = lazy(() => import('../../pages/admin/PopupManagement'));

// Wrapped components with loading states
export const LazyHomeWrapper = (props) => (
  <LazyWrapper component={LazyHome} {...props} />
);

export const LazyCoursesListWrapper = (props) => (
  <LazyWrapper component={LazyCoursesList} {...props} />
);

export const LazyCourseDetailsWrapper = (props) => (
  <LazyWrapper component={LazyCourseDetails} {...props} />
);

export const LazyPlayerWrapper = (props) => (
  <LazyWrapper component={LazyPlayer} {...props} />
);

export const LazyPaymentWrapper = (props) => (
  <LazyWrapper component={LazyPayment} {...props} />
);

export const LazyEnhancedPaymentWrapper = (props) => (
  <LazyWrapper component={LazyEnhancedPayment} {...props} />
);

export const LazyRegisterWrapper = (props) => (
  <LazyWrapper component={LazyRegister} {...props} />
);

export const LazyLoginWrapper = (props) => (
  <LazyWrapper component={LazyLogin} {...props} />
);

export const LazyKycWrapper = (props) => (
  <LazyWrapper component={LazyKyc} {...props} />
);

export const LazyReferralWrapper = (props) => (
  <LazyWrapper component={LazyReferral} {...props} />
);

export const LazyProfileWrapper = (props) => (
  <LazyWrapper component={LazyProfile} {...props} />
);

export const LazyAboutUsWrapper = (props) => (
  <LazyWrapper component={LazyAboutUs} {...props} />
);

export const LazyPolicyWrapper = (props) => (
  <LazyWrapper component={LazyPolicy} {...props} />
);

export const LazyHelpWrapper = (props) => (
  <LazyWrapper component={LazyHelp} {...props} />
);

export const LazyFAQWrapper = (props) => (
  <LazyWrapper component={LazyFAQ} {...props} />
);

export const LazyTermsWrapper = (props) => (
  <LazyWrapper component={LazyTerms} {...props} />
);

export const LazyRefundWrapper = (props) => (
  <LazyWrapper component={LazyRefund} {...props} />
);

export const LazyContactWrapper = (props) => (
  <LazyWrapper component={LazyContact} {...props} />
);

// Admin wrappers
export const LazyDashboardWrapper = (props) => (
  <LazyWrapper component={LazyDashboard} {...props} />
);

export const LazyEducatorWrapper = (props) => (
  <LazyWrapper component={LazyEducator} {...props} />
);

export const LazyMyCourseWrapper = (props) => (
  <LazyWrapper component={LazyMyCourse} {...props} />
);

export const LazyAddCourseWrapper = (props) => (
  <LazyWrapper component={LazyAddCourse} {...props} />
);

export const LazyStudentsEnrolledWrapper = (props) => (
  <LazyWrapper component={LazyStudentsEnrolled} {...props} />
);

export const LazyKycReviewWrapper = (props) => (
  <LazyWrapper component={LazyKycReview} {...props} />
);

export const LazyPendingOrdersWrapper = (props) => (
  <LazyWrapper component={LazyPendingOrders} {...props} />
);

export const LazyWithdrawalManagementWrapper = (props) => (
  <LazyWrapper component={LazyWithdrawalManagement} {...props} />
);

export const LazyPopupManagementWrapper = (props) => (
  <LazyWrapper component={LazyPopupManagement} {...props} />
);

export default LazyWrapper;
