import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import axios from 'axios';

import Dashboard from '../../components/profile/Dashboard';
import Earnings from '../../components/profile/Earnings';
import Referrals from '../../components/profile/Referrals';
import Courses from '../../components/profile/Courses';
import PaymentStatements from '../../components/profile/PaymentStatements';
import PurchaseHistory from '../../components/profile/PurchaseHistory';
import Leaderboard from '../../components/profile/Leaderboard';
import EditProfile from '../../components/profile/EditProfile';
import Sidebar from '../../components/profile/Sidebar';
import MobileHeader from '../../components/profile/MobileHeader';
import Affilated from '../../components/profile/Affilated';
import WithdrawalRequest from '../../components/profile/WithdrawalRequest';
import WithdrawalHistory from '../../components/profile/WithdrawalHistory';
import Withdrawal from '../../components/profile/Withdrawal';
import Footer from '../../components/users/Footer';
import Kyc from './Kyc';
import KycDetails from '../../components/profile/KycDetails';

const customStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom);
  }
  .sidebar-overlay {
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }
  .sidebar-slide {
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
  }
  .sidebar-slide.open {
    transform: translateX(0);
  }
  .glass-effect {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  @media (max-width: 640px) {
    .mobile-optimized {
      font-size: 14px;
    }
  }
`;

const Profile = () => {
  const { userData, navigate, backendUrl, getToken, currency } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [earningsData, setEarningsData] = useState({
    lifetime: 0,
    today: 0,
    lastSevenDays: 0,
    thisMonth: 0,
    withdrawableBalance: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    availableBalance: 0
  });
  const [referralData, setReferralData] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paymentStatements, setPaymentStatements] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [withdrawalRequestOpen, setWithdrawalRequestOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profileImageFile: null,
    passwordData: null
  });

  const [profileEditStatus, setProfileEditStatus] = useState({
    hasEditedProfile: false,
    profileEditDate: null
  });

  useEffect(() => {
    if (userData) {
      setEditForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        profileImageFile: null,
        passwordData: null
      });

      // Check if user has edited profile before
      if (userData.lastProfileEdit) {
        setProfileEditStatus({
          hasEditedProfile: true,
          profileEditDate: userData.lastProfileEdit
        });
      }

      // Fetch additional data
      fetchProfileData();
    }
  }, [userData]);

  // Function to refresh user data
  const refreshUserData = async () => {
    try {
      // Force refresh all profile data including earnings
      await fetchProfileData();
      
      // Also refresh context user data
      if (window.location.reload) {
        window.location.reload();
      }
    } catch (error) {
      // Silent error handling for refresh
    }
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await getToken();

      // Fetch all profile related data
      const [earningsRes, referralsRes, userPurchaseRes, leaderboardRes, paymentStatementsRes, purchaseHistoryRes] = await Promise.all([
        axios.get(`${backendUrl}/api/users/earnings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/users/referrals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/users/user-purchase`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/users/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/users/payment-statements`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/users/purchase-history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (earningsRes.data.success) {
        setEarningsData({
          ...earningsRes.data.earnings,
          // Ensure withdrawal balance data is included
          withdrawableBalance: earningsRes.data.earnings.withdrawableBalance || 0,
          totalWithdrawn: earningsRes.data.earnings.totalWithdrawn || 0,
          pendingWithdrawals: earningsRes.data.earnings.pendingWithdrawals || 0,
          availableBalance: earningsRes.data.earnings.availableBalance || 0
        });
      }

      if (referralsRes.data.success) {
        setReferralData(referralsRes.data.referrals);
      }

      if (userPurchaseRes.data.success) {
        setPurchasedCourses(userPurchaseRes.data.purchasedCourses || []);
      }

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      }

      if (paymentStatementsRes.data.success) {
        setPaymentStatements(paymentStatementsRes.data.statements);
      }

      if (purchaseHistoryRes.data.success) {
        setPurchaseHistory(purchaseHistoryRes.data.purchases);
      }
    } catch (error) {
      let errorMessage;
      if (error.response?.status === 404) {
        errorMessage = 'Profile data not found. Please check your account or contact support.';
      } else {
        errorMessage = 'Failed to fetch profile data.';
      }
      // Set mock data for demonstration
      setEarningsData({
        lifetime: userData?.affiliateEarnings || 0,
        today: 0,
        lastSevenDays: 0,
        thisMonth: 0,
        withdrawableBalance: userData?.withdrawableBalance || 0,
        totalWithdrawn: userData?.totalWithdrawn || 0,
        pendingWithdrawals: userData?.pendingWithdrawals || 0,
        availableBalance: (userData?.withdrawableBalance || 0) - (userData?.pendingWithdrawals || 0)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    
    // Check if user has already edited profile once (only for text fields, not profile picture)
    if (profileEditStatus.hasEditedProfile && !editForm.profileImageFile) {
      return;
    }
    
    try {
      const token = await getToken();
      
      // Create FormData to handle both text fields and file upload
      const formData = new FormData();
      
      // Only add text fields if user hasn't edited profile before
      if (!profileEditStatus.hasEditedProfile) {
        formData.append('firstName', editForm.firstName);
        formData.append('lastName', editForm.lastName);
        formData.append('email', editForm.email);
      }
      
      // Always allow profile image updates
      if (editForm.profileImageFile) {
        formData.append('image', editForm.profileImageFile);
      }

      // Add password data if provided
      if (editForm.passwordData) {
        formData.append('currentPassword', editForm.passwordData.currentPassword);
        formData.append('newPassword', editForm.passwordData.newPassword);
      }

      const response = await axios.put(
        `${backendUrl}/api/users/update-profile`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );

      if (response.data.success) {
        // Only update the restriction status if this is the first time editing text fields
        if (!profileEditStatus.hasEditedProfile) {
          setProfileEditStatus({
            hasEditedProfile: true,
            profileEditDate: new Date()
          });
        }
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      // Handle specific error for profile edit restriction
      if (error.response?.status === 403 && error.response?.data?.hasEditedProfile) {
        // Update local state
        setProfileEditStatus({
          hasEditedProfile: true,
          profileEditDate: error.response.data.profileEditDate
        });
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="text-rose-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please login to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 transition-colors font-medium"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }


  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const affiliateCode = userData.affiliateCode;
  const affiliateLink = affiliateCode ? `${window.location.origin}/?ref=${affiliateCode}` : '';

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'earnings', label: 'Earnings', icon: '💰' },
    { id: 'withdrawal', label: 'Withdrawal', icon: '💸' },
    { id: 'referrals', label: 'My Referrals', icon: '👥' },
    { id: 'courses', label: 'My Packages', icon: '📚' },
    { id: 'statements', label: 'Payment Statements', icon: '📄' },
    { id: 'purchase-history', label: 'Purchase History', icon: '🛒' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'affiliated', label: 'Affilated Link', icon: '🔗'},
    { id: 'edit', label: 'Edit Profile', icon: '✏️' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            userData={userData}
            earningsData={earningsData}
            currency={currency}
            affiliateCode={affiliateCode}
            affiliateLink={affiliateLink}
            copyToClipboard={copyToClipboard}
            purchasedCourses={purchasedCourses}
            referralData={referralData}
            leaderboard={leaderboard}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        );
      case 'withdrawal':
        return (
          <Withdrawal
            userData={userData}
            earningsData={earningsData}
            currency={currency}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        );
      case 'earnings':
        return (
          <Earnings
            earningsData={earningsData}
            currency={currency}
            referralData={referralData}
            userData={userData}
          />
        );
      case 'referrals':
        return (
          <Referrals
            referralData={referralData}
            currency={currency}
            setActiveTab={setActiveTab}
            userData={userData}
            backendUrl={backendUrl}
            getToken={getToken}
          />
        );
      case 'kyc':
        return (
          userData?.kycStatus === 'verified' ? (
            <KycDetails />
          ) : (
            <Kyc />
          )
        );
      case 'courses':
        return (
          <Courses
            purchasedCourses={purchasedCourses}
            currency={currency}
            navigate={navigate}
          />
        );
      case 'affiliated':
        return (
          <Affilated
            affiliateCode={affiliateCode}
            affiliateLink={affiliateLink}
            copyToClipboard={copyToClipboard}
          />
        );
      case 'statements':
        return (
          <PaymentStatements
            paymentStatements={paymentStatements}
            currency={currency}
          />
        );
      case 'purchase-history':
        return (
          <PurchaseHistory
            purchaseHistory={purchaseHistory}
            currency={currency}
            navigate={navigate}
          />
        );
      case 'leaderboard':
        return (
          <Leaderboard
            leaderboard={leaderboard}
            userData={userData}
            currency={currency}
            earningsData={earningsData}
          />
        );
      case 'edit':
        return (
          <EditProfile
            userData={userData}
            editForm={editForm}
            setEditForm={setEditForm}
            handleEditProfile={handleEditProfile}
            setActiveTab={setActiveTab}
            currency={currency}
            profileEditStatus={profileEditStatus}
          />
        );
      default:
        return (
          <Dashboard
            userData={userData}
            earningsData={earningsData}
            currency={currency}
            affiliateCode={affiliateCode}
            affiliateLink={affiliateLink}
            copyToClipboard={copyToClipboard}
            purchasedCourses={purchasedCourses}
            referralData={referralData}
            leaderboard={leaderboard}
            navigate={navigate}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-blue-50">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 sidebar-overlay z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex">
          {/* Sidebar Component */}
          <Sidebar
            userData={userData}
            fullName={fullName}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            earningsData={earningsData}
            purchasedCourses={purchasedCourses}
            currency={currency}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Header Component */}
            <MobileHeader
              userData={userData}
              activeTab={activeTab}
              sidebarItems={sidebarItems}
              setSidebarOpen={setSidebarOpen}
            />

            {/* Content Area */}
            <div className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading your profile...</p>
                    <p className="text-gray-500 text-sm mt-1">Please wait while we fetch your data</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-7xl mx-auto">
                  {renderContent()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Profile;
