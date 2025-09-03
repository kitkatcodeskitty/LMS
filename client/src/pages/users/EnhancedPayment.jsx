import React, { useState, useContext, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/users/Footer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import axios from 'axios';

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
        console.log('Registration successful! You can now complete your payment.');
        setShowRegistration(false);
        
        // Reset profile image states
        setProfileImageFile(null);
        setProfilePreviewImage(null);
        
        // Update user context without page reload
        storeAuthData(data.token, data.user);
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
        console.log('Login successful! You can now complete your payment.');
        setShowRegistration(false);
        setShowLogin(false);
        // Update user context without page reload
        storeAuthData(data.token, data.user);
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
    navigate('/my-enrollments');
  };

  if (loadingCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading package details...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {showRegistration ? 'Register & Pay for Package' : 'Complete Your Payment'}
          </h1>
          <p className="text-gray-600">
            {referralFromUrl && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-2">
                🎯 Referral Applied: {referralFromUrl}
              </span>
            )}
            Secure payment for your package enrollment
          </p>
        </div>

        {/* Course Summary Card */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Package Summary</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              {course.courseThumbnail && (
                <img 
                  src={course.courseThumbnail} 
                  alt={course.courseTitle}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h3 className="text-xl font-medium text-gray-900">{course.courseTitle}</h3>
                {course.courseDescription && (
                  <div 
                    className="text-sm text-gray-600 mt-1 line-clamp-2 rich-text"
                    dangerouslySetInnerHTML={{ __html: course.courseDescription }}
                  ></div>
                )}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-3xl font-bold text-green-600">
                {appCurrency}{Math.round(course.coursePrice) || '0'}
              </div>
            </div>
          </div>
        </Card>

        {/* Warning Card */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">⚠️ Important Payment Warning</h3>
              <div className="text-sm text-orange-700 space-y-2">
                <p><strong>Before proceeding with payment, please note:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Pay the <strong>exact amount</strong> shown above - no more, no less</li>
                  <li>Double-check the package details before making payment</li>
                  <li>Keep your payment receipt and transaction ID safe</li>
                  <li>Upload a clear screenshot of your payment confirmation</li>
                  <li>Payment verification may take up to 24 hours</li>
                  <li>No refunds will be processed for incorrect amounts</li>
                </ul>
                <p className="mt-3 font-medium">If you have any questions, contact support before making payment.</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Layout for non-logged users: Registration/Login + Payment sections */}
        {showRegistration ? (
          <div className="space-y-8">
            {/* Step 1: Authentication Section */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-semibold mr-3">
                  1
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {showLogin ? 'Login to Your Account' : 'Create Your Account'}
                </h2>
              </div>
              
              {/* Toggle buttons */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    !showLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    showLogin 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Login
                </button>
              </div>

              {showLogin ? (
                /* Login Form */
                <div>
                  <p className="text-gray-600 mb-6">Login to your existing account to proceed with the payment</p>
                  
                  {/* Login Error Message */}
                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 text-sm font-medium">{loginError}</p>
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      Login & Continue to Payment
                    </Button>
                  </form>
                </div>
              ) : (
                /* Registration Form */
                <div>
                  <p className="text-gray-600 mb-6">Create your account to proceed with the payment</p>
              
              <form onSubmit={handleRegistration} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={registrationData.firstName}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={registrationData.lastName}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registrationData.email}
                    onChange={handleRegistrationChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registrationData.password}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength="8"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registrationData.confirmPassword}
                      onChange={handleRegistrationChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      minLength="8"
                      required
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
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
                            className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-blue-200"
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
                    Create Account & Continue to Payment
                  </Button>
                </form>
                </div>
              )}
            </Card>

            {/* Step 2: Payment Form for Non-Logged Users */}
            <Card>
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white rounded-full font-semibold mr-3">
                  2
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Complete Your Payment</h2>
              </div>
              <p className="text-gray-600 mb-6">Fill in your payment details below:</p>
               
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Payment Instructions */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Payment Instructions</h3>
                  <div className="text-center">
                    <div className="inline-block p-3 bg-gray-50 rounded-lg">
                      <img src="/qr.jpg" alt="Payment QR Code" className="w-32 h-32 mx-auto rounded-lg shadow-sm" />
                    </div>
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-lg font-bold text-red-700">
                        Pay Exactly: {appCurrency}{Math.round(course.coursePrice) || '0'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Pay the exact amount shown above</li>
                      <li>• Higher or lower amounts will not be accepted</li>
                      <li>• No refunds will be processed</li>
                      <li>• Keep your transaction receipt safe</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Payment Form */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800">Payment Details</h3>
                  
                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    {/* Transaction ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transaction ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Enter your transaction ID from payment receipt"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Referral Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referral Code {referralFromUrl && <span className="text-green-600">(Pre-filled from link)</span>}
                      </label>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const value = e.target.value;
                          setReferralCode(value);
                        }}
                        placeholder="Enter referral code (optional)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {referralFromUrl 
                          ? 'Referral code pre-filled from your link, but you can change it if needed' 
                          : 'Use a referral code to help your referrer earn commissions'
                        }
                      </p>
                    </div>

                    {/* Payment Screenshot */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Screenshot <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          name="paymentScreenshot"
                          onChange={handleFileChange}
                          className="hidden"
                          id="screenshot-upload-non-logged"
                          required
                        />
                        <label htmlFor="screenshot-upload-non-logged" className="cursor-pointer">
                          {previewImage ? (
                            <div className="space-y-2">
                              <img
                                src={previewImage}
                                alt="Payment screenshot preview"
                                className="max-w-full max-h-32 mx-auto rounded-lg shadow-sm"
                              />
                              <p className="text-sm text-green-600 font-medium">Screenshot uploaded successfully!</p>
                              <p className="text-xs text-gray-500">Click to change image</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-2xl text-gray-400">📷</div>
                              <p className="text-sm text-gray-500">Upload payment screenshot</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      variant="info"
                      size="lg"
                      fullWidth
                    >
                      Submit Payment Details
                    </Button>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          /* Show payment section for logged-in users */
          <div className="space-y-6">
            {/* Welcome message for logged-in users */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👋</div>
                <div>
                  <h3 className="font-semibold text-green-800">
                    Welcome back, {userData?.firstName}!
                  </h3>
                  <p className="text-sm text-green-600">
                    You're logged in and ready to complete your payment for this package.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Payment Instructions */}
              <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Instructions</h2>
              
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-gray-50 rounded-lg">
                  <img src="/qr.jpg" alt="Payment QR Code" className="w-48 h-48 mx-auto rounded-lg shadow-sm" />
                </div>
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-lg font-bold text-red-700 mb-2">
                    Pay Exactly: {appCurrency}{Math.round(course.coursePrice) || '0'}
                  </p>
                  <p className="text-sm text-red-600">
                    Scan the QR code above to make payment
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Pay the exact amount shown above</li>
                    <li>• Higher or lower amounts will not be accepted</li>
                    <li>• No refunds will be processed</li>
                    <li>• Keep your transaction receipt safe</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">📱 Payment Steps:</h3>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Scan the QR code with your payment app</li>
                    <li>2. Enter the exact amount: {appCurrency}{Math.round(course.coursePrice) || '0'}</li>
                    <li>3. Complete the payment</li>
                    <li>4. Take a screenshot of the confirmation</li>
                    <li>5. Fill the form and upload the screenshot</li>
                  </ol>
                </div>
              </div>
            </Card>

            {/* Right Column: Payment Form */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
              
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Transaction ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter your transaction ID from payment receipt"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Copy the transaction ID exactly as shown in your payment confirmation
                  </p>
                </div>

                {/* Referral Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code {referralFromUrl && <span className="text-green-600">(Applied from link)</span>}
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
                    className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:border-transparent transition-colors ${
                      (referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                        ? 'border-red-300 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-blue-500'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
        size="md"
        showCloseButton={false}
        closeOnOverlayClick={false}
      >
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Payment Submitted!</h3>
          <p className="text-gray-600 mb-6">
            Your payment details have been submitted successfully. Our admin team will validate your payment within 24 hours.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>What's next?</strong><br />
              You'll receive an email confirmation once your payment is verified and your package access is activated.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
                              onClick={() => navigate('/packages-list')}
              variant="secondary"
              fullWidth
            >
                              Browse More Packages
            </Button>
            <Button
              onClick={closeModal}
              variant="info"
              fullWidth
            >
              View My Enrollments
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default EnhancedPayment;