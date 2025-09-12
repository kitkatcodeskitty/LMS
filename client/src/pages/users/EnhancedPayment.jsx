import React, { useState, useContext, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/users/Footer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import axios from 'axios';
import { 
  FaExclamationTriangle, 
  FaBullseye, 
  FaMobileAlt, 
  FaCamera, 
  FaHands, 
  FaCheckCircle,
  FaUserPlus,
  FaSignInAlt
} from 'react-icons/fa';

const EnhancedPayment = () => {
  const { courseId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, getToken, currency: appCurrency, userData, storeAuthData } = useContext(AppContext);
  
  // Get referral code from URL params
  const urlParams = new URLSearchParams(location.search);
  const referralFromUrl = urlParams.get('ref') || '';

  // Course and user states
  const [course, setCourse] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [loadingPurchasedCourses, setLoadingPurchasedCourses] = useState(false);
  
  // Payment form states
  const [referralCode, setReferralCode] = useState(referralFromUrl);
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Registration form states (for non-logged users)
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLogin, setShowLogin] = useState(false); // Toggle between login and registration
  const [registrationData, setRegistrationData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [registering, setRegistering] = useState(false);
  
  // Profile image states for registration
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreviewImage, setProfilePreviewImage] = useState(null);

  // Login form states
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Update showRegistration based on userData
  useEffect(() => {
    setShowRegistration(!userData);
    setShowLogin(false); // Reset login state when userData changes
  }, [userData]);

  // Fetch purchased courses when userData changes
  useEffect(() => {
    if (userData) {
      fetchPurchasedCourses();
    } else {
      setPurchasedCourses([]);
    }
  }, [userData]);

  // Check if user is trying to use their own referral code from URL
  useEffect(() => {
    if (userData && referralFromUrl && referralFromUrl === userData.affiliateCode) {
      
      setReferralCode(''); // Clear the referral code
    }
  }, [userData, referralFromUrl]);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/${courseId}`);
      if (data.success && data.course) {
        console.log('Course data loaded:', data.course);
        setCourse(data.course);
      } else {
        console.error(data.message || 'Package not found');
        navigate('/packages-list');
      }
    } catch (error) {
              console.error(error.response?.data?.message || 'Error loading package details');
        navigate('/packages-list');
    } finally {
      setLoadingCourse(false);
    }
  };

  const fetchPurchasedCourses = async () => {
    if (!userData) {
      setPurchasedCourses([]);
      return;
    }

    setLoadingPurchasedCourses(true);
    try {
      const token = await getToken();
      if (!token) {
        setPurchasedCourses([]);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setPurchasedCourses(data.purchasedCourses || []);
      } else {
        setPurchasedCourses([]);
      }
    } catch (error) {
      console.error('Error fetching purchased courses:', error);
      setPurchasedCourses([]);
    } finally {
      setLoadingPurchasedCourses(false);
    }
  };

  const handleRegistrationChange = (e) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (loginError) setLoginError('');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.error('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      setProfileImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (registrationData.password !== registrationData.confirmPassword) {
      console.error('Passwords do not match');
      return;
    }

    if (registrationData.password.length < 8) {
      console.error('Password must be at least 8 characters long');
      return;
    }

    setRegistering(true);

    try {
      const formData = new FormData();
      formData.append('firstName', registrationData.firstName);
      formData.append('lastName', registrationData.lastName);
      formData.append('email', registrationData.email);
      formData.append('password', registrationData.password);

      if (profileImageFile) {
        formData.append('image', profileImageFile);
      }

      const { data } = await axios.post(`${backendUrl}/api/users/register`, formData);

      if (data.success) {
        // Store token and update user data
        localStorage.setItem('token', data.token);
        console.log('Registration successful! Redirecting to payment...');
        
        // Reset profile image states
        setProfileImageFile(null);
        setProfilePreviewImage(null);
        
        // Update user context without page reload
        storeAuthData(data.token, data.user);
        
        // Redirect to payment page with course data
        navigate(`/payment/${courseId}`, { 
          state: { 
            courseId, 
            courseTitle: course?.courseTitle, 
            coursePrice: course?.coursePrice,
            currency: appCurrency,
            referralCode: referralCode
          } 
        });
      } else {
        console.error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setLoginError('');
    
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in all fields');
      return;
    }

    setLoggingIn(true);

    try {
      const { data } = await axios.post(`${backendUrl}/api/users/login`, {
        email: loginData.email,
        password: loginData.password
      });

      if (data.success) {
        // Store token and update user data
        localStorage.setItem('token', data.token);
        console.log('Login successful! Redirecting to payment...');
        
        // Update user context without page reload
        storeAuthData(data.token, data.user);
        
        // Redirect to payment page with course data
        navigate(`/payment/${courseId}`, { 
          state: { 
            courseId, 
            courseTitle: course?.courseTitle, 
            coursePrice: course?.coursePrice,
            currency: appCurrency,
            referralCode: referralCode
          } 
        });
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Login failed';
      setLoginError(errorMessage);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        console.error('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      setPaymentScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    if (!transactionId.trim()) {
      console.error('Please enter your transaction ID.');
      setIsSubmitting(false);
      return;
    }

    if (!paymentScreenshot) {
      console.error('Please upload a payment screenshot.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('Please login to continue');
        setIsSubmitting(false);
        return;
      }

      // Get user data from token if not available in context
      let currentUserData = userData;
      if (!currentUserData) {
        try {
          const response = await axios.get(`${backendUrl}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            currentUserData = response.data.user;
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      }

      // Prevent users from using their own referral code
      if (referralCode.trim() && currentUserData?.affiliateCode && referralCode.trim() === currentUserData.affiliateCode) {
        console.error('You cannot use your own referral code for purchases.');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('referralCode', referralCode.trim() || '');
      formData.append('transactionId', transactionId.trim());
      formData.append('paymentScreenshot', paymentScreenshot);

      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add course to cart');
      }

      console.log('Payment submitted successfully! Wait for admin validation.');
      setShowModal(true);
      
      // Reset form
      setReferralCode(referralFromUrl);
      setTransactionId('');
      setPaymentScreenshot(null);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    navigate('/profile');
  };

  if (loadingCourse || (userData && loadingPurchasedCourses)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loadingCourse ? 'Loading package details...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Package Not Found</h2>
        <p className="text-gray-600 mb-6">The package you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/packages-list')} variant="info">
          Browse Packages
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-rose-50/30 to-gray-100">
      {/* Custom CSS for checkmark animation */}
      <style jsx>{`
        @keyframes checkmark {
          0% {
            stroke-dasharray: 0 50;
            stroke-dashoffset: 0;
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
          100% {
            stroke-dasharray: 50 0;
            stroke-dashoffset: 0;
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes logoGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(244, 63, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(244, 63, 94, 0.6), 0 0 40px rgba(244, 63, 94, 0.3);
          }
        }
        
        .logo-glow {
          animation: logoGlow 2s ease-in-out infinite;
        }
      `}</style>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-lg opacity-20 scale-110"></div>
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <FaHands className="text-xl text-white" />
          </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {showRegistration ? 'Create Your Account' : (userData && purchasedCourses.length === 0) ? 'Complete Your Purchase' : 'Welcome Back'}
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {referralFromUrl && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 mr-2 border border-rose-200 shadow-sm">
                <FaBullseye className="mr-1" /> Referral Applied: {referralFromUrl}
              </span>
            )}
            {showRegistration ? 'Join our community and start your learning journey' : (userData && purchasedCourses.length === 0) ? 'Complete your payment to access this package' : 'Sign in to continue with your payment'}
          </p>
        </div>

        {/* Course Summary Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-4 -m-6 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <FaCheckCircle className="text-white" />
            </div>
              <h2 className="text-lg font-semibold text-white">Package Summary</h2>
          </div>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-4">
              {/* Top Row: Image and Price */}
              <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
                  {course.courseThumbnail ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-xl blur-sm opacity-30 scale-105"></div>
                <img 
                  src={course.courseThumbnail} 
                        alt={course.courseTitle || 'Course Image'}
                        className="relative w-16 h-16 rounded-xl object-cover shadow-lg border-2 border-white"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                      <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">
                      {course.courseTitle || 'Package Title'}
                    </h3>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl blur-sm opacity-30 scale-105"></div>
                    <div className="relative inline-flex items-center bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-3 rounded-xl shadow-lg">
                      <span className="text-lg font-bold">{appCurrency}{Math.round(course.coursePrice) || '0'}</span>
                      <div className="ml-2 text-xs opacity-90">
                        <div>Total Price</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description Row - Full Width */}
                {course.courseDescription && (
                <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div 
                    className="text-sm text-gray-600 line-clamp-3 rich-text leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: course.courseDescription }}
                  ></div>
                </div>
                )}
              </div>
            </div>
        </Card>

        {/* Warning Card */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-gradient-to-r from-orange-50 to-red-50">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 -m-6 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                <FaExclamationTriangle className="text-white" />
                </div>
              <h3 className="text-lg font-semibold text-white">Important Payment Guidelines</h3>
              </div>
            </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              <p className="font-semibold text-sm text-orange-800 mb-3">Before proceeding with payment, please note:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">Pay the <strong className="text-orange-800">exact amount</strong> shown above - no more, no less</p>
          </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">Double-check the package details before making payment</p>
              </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">Keep your payment receipt and transaction ID safe</p>
            </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">Upload a clear screenshot of your payment confirmation</p>
              </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">Payment verification may take up to 24 hours</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-orange-700">No refunds will be processed for incorrect amounts</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="font-medium text-sm text-orange-800">If you have any questions, contact support before making payment.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Layout for non-logged users: Registration/Login + Payment sections */}
        {showRegistration || (userData && purchasedCourses.length === 0) ? (
          <div className="space-y-8">
            {/* Step 1: Authentication Section */}
            <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 -m-6 mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white/20 text-white rounded-lg flex items-center justify-center mr-3 font-bold">
                  1
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white">
                    {showLogin ? 'Welcome Back!' : (userData && purchasedCourses.length === 0) ? 'Complete Your Purchase' : 'Join Our Community'}
                </h2>
                    <p className="text-sm text-white/90">
                    {showLogin ? 'Sign in to continue with your payment' : (userData && purchasedCourses.length === 0) ? 'Complete your payment to access this package' : 'Create your account to get started'}
                  </p>
                </div>
              </div>
              </div>
              <div className="px-6 pb-6">
              {/* Toggle buttons */}
                <div className="flex mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !showLogin 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <FaUserPlus className="inline mr-2" />
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                    showLogin 
                        ? 'bg-white text-blue-600 shadow-lg transform scale-105' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <FaSignInAlt className="inline mr-2" />
                  Login
                </button>
              </div>

              {showLogin ? (
                /* Login Form */
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {userData && purchasedCourses.length === 0 
                      ? 'Login to your account to complete your payment for this package' 
                      : 'Login to your existing account to proceed with the payment'
                    }
                  </p>
                  
                  {/* Login Error Message */}
                  {loginError && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-3 h-3 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 text-xs font-medium">{loginError}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      loading={loggingIn}
                      disabled={loggingIn}
                      variant="info"
                      size="lg"
                      fullWidth
                    >
                      <FaSignInAlt className="mr-2" />
                      Login & Continue
                    </Button>
                  </form>
                </div>
              ) : (
                /* Registration Form */
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {userData && purchasedCourses.length === 0 
                      ? 'Create your account to complete your payment for this package' 
                      : 'Create your account to proceed with the payment'
                    }
                  </p>
              
              <form onSubmit={handleRegistration} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={registrationData.firstName}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={registrationData.lastName}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registrationData.password}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Create a password"
                      minLength="8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registrationData.confirmPassword}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      minLength="8"
                      required
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Profile Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-rose-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload" className="cursor-pointer">
                      {profilePreviewImage ? (
                        <div className="space-y-2">
                          <img
                            src={profilePreviewImage}
                            alt="Profile preview"
                            className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-rose-200"
                          />
                          <p className="text-sm text-green-600 font-medium">Image uploaded successfully!</p>
                          <p className="text-xs text-gray-500">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload profile picture</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  loading={registering}
                  disabled={registering}
                  variant="info"
                  size="lg"
                  fullWidth
                >
                  <FaUserPlus className="mr-2" />
                  Create Account & Continue
                </Button>
                </form>
                </div>
              )}
              </div>
            </Card>
          </div>
        ) : (
          /* Show payment section for logged-in users */
          <div className="space-y-6">
            {/* Welcome message for logged-in users */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">👋</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-green-800">
                    Welcome back, {userData?.firstName}!
                  </h3>
                  <p className="text-sm text-green-600">
                    {purchasedCourses.length === 0 
                      ? 'Complete your payment to access this package and start your learning journey.'
                      : 'You\'re logged in and ready to complete your payment for this package.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Payment Instructions */}
              <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 -m-6 mb-6">
                  <h2 className="text-lg font-semibold text-white">Payment Instructions</h2>
                </div>
                <div className="px-6 pb-6">
                <div className="text-center mb-6">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-2xl blur-lg opacity-20 scale-110"></div>
                      <div className="relative inline-block p-4 bg-white rounded-2xl shadow-2xl">
                        <img src="/qr.jpg" alt="Payment QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-lg" />
                  </div>
                    </div>
                    <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl shadow-sm">
                      <p className="text-lg font-bold text-rose-700 mb-1">
                      Pay Exactly: {appCurrency}{Math.round(course.coursePrice) || '0'}
                    </p>
                      <p className="text-sm text-rose-600">
                      Scan the QR code above to make payment
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-rose-800 mb-1">⚠️ Important Notes:</h3>
                    <ul className="text-xs text-rose-700 space-y-1">
                      <li>• Pay the exact amount shown above</li>
                      <li>• Higher or lower amounts will not be accepted</li>
                      <li>• No refunds will be processed</li>
                      <li>• Keep your transaction receipt safe</li>
                    </ul>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-rose-800 mb-1">📱 Payment Steps:</h3>
                    <ol className="text-xs text-rose-700 space-y-1">
                      <li>1. Scan the QR code with your payment app</li>
                      <li>2. Enter the exact amount: {appCurrency}{Math.round(course.coursePrice) || '0'}</li>
                      <li>3. Complete the payment</li>
                      <li>4. Take a screenshot of the confirmation</li>
                      <li>5. Fill the form and upload the screenshot</li>
                    </ol>
                  </div>
                  </div>
                </div>
              </Card>

            {/* Right Column: Payment Form */}
            <Card>
              <h2 className="text-base font-medium text-gray-900 mb-4">Payment Details</h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                {/* Transaction ID */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your transaction ID from payment receipt"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Copy the transaction ID exactly as shown in your payment confirmation
                  </p>
                </div>

                {/* Referral Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Referral Code {referralFromUrl && <span className="text-rose-600">(Applied from link)</span>}
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReferralCode(value);
                      
                      // Show warning if user tries to enter their own referral code
                      if (value.trim() && userData?.affiliateCode && value.trim() === userData.affiliateCode) {
                
                      }
                    }}
                    placeholder="Enter referral code (optional)"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition-colors ${
                      (referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                        ? 'border-red-300 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-rose-500'
                    }`}
                    readOnly={!!referralFromUrl}
                  />
                  <p className={`text-xs mt-1 ${
                    (referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {(referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                      ? '⚠️ You cannot use your own referral code'
                      : referralFromUrl 
                        ? 'Referral code applied from your link' 
                        : 'Use a referral code to help your referrer earn commissions'
                    }
                  </p>
                </div>

                {/* Payment Screenshot */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-rose-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      name="paymentScreenshot"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot-upload"
                      required
                    />
                    <label htmlFor="screenshot-upload" className="cursor-pointer">
                      {previewImage ? (
                        <div className="space-y-3">
                          <img
                            src={previewImage}
                            alt="Payment screenshot preview"
                            className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                          />
                          <p className="text-sm text-green-600 font-medium">Screenshot uploaded successfully!</p>
                          <p className="text-xs text-gray-500">Click to change image</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-4xl text-gray-400">📷</div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upload payment screenshot</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  variant="info"
                  size="lg"
                  fullWidth
                >
                  <FaCheckCircle className="mr-2" />
                  Submit Payment Details
                </Button>
              </form>
            </Card>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        size="lg"
        showCloseButton={false}
        closeOnOverlayClick={false}
      >
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 opacity-50"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full -translate-y-16 translate-x-16 opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200 to-pink-200 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
          
          <div className="relative z-10 text-center p-8">
            {/* Animated Logo and Checkmark */}
            <div className="relative mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full shadow-2xl mb-4 logo-glow">
                <img 
                  src="/logo.png" 
                  alt="GrowthNepal Logo" 
                  className="w-16 h-16 object-contain filter brightness-0 invert"
                />
              </div>
              
              {/* Animated Checkmark */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg 
                  className="w-8 h-8 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{
                    animation: 'checkmark 0.6s ease-in-out 0.2s both'
                  }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Payment Submitted Successfully!
              </h3>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Your payment details have been submitted successfully. Our admin team will validate your payment within 24 hours.
              </p>
            </div>

            {/* What's Next Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-blue-800">What's Next?</h4>
              </div>
              <p className="text-blue-700 leading-relaxed">
                You'll receive an email confirmation once your payment is verified and your package access is activated. 
                Check your email for updates and login to your dashboard to track your progress.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/packages-list')}
                variant="secondary"
                size="lg"
                fullWidth
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Browse More Packages
              </Button>
              <Button
                onClick={closeModal}
                variant="info"
                size="lg"
                fullWidth
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Go to Profile Dashboard
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default EnhancedPayment;