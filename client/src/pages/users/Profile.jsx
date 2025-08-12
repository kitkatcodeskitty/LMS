import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { toast } from 'react-toastify';
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
    thisMonth: 0
  });
  const [referralData, setReferralData] = useState([]);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [paymentStatements, setPaymentStatements] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (userData) {
      setEditForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || ''
      });
      fetchProfileData();
    }
  }, [userData]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const token = await getToken();

      // Fetch all profile related data
      const [earningsRes, referralsRes, coursesRes, leaderboardRes, statementsRes, purchaseHistoryRes] = await Promise.all([
        axios.get(`${backendUrl}/api/user/earnings`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/referrals`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/user-purchase`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/leaderboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/payment-statements`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/purchase-history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (earningsRes.data.success) {
        setEarningsData(earningsRes.data.earnings);
      }

      if (referralsRes.data.success) {
        setReferralData(referralsRes.data.referrals);
      }

      if (coursesRes.data.success) {
        setPurchasedCourses(coursesRes.data.purchasedCourses || []);
      }

      if (leaderboardRes.data.success) {
        setLeaderboard(leaderboardRes.data.leaderboard);
      }

      if (statementsRes.data.success) {
        setPaymentStatements(statementsRes.data.statements);
      }

      if (purchaseHistoryRes.data.success) {
        setPurchaseHistory(purchaseHistoryRes.data.purchases);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Set mock data for demonstration
      setEarningsData({
        lifetime: userData?.affiliateEarnings || 0,
        today: 0,
        lastSevenDays: 0,
        thisMonth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await axios.put(
        `${backendUrl}/api/user/update-profile`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Profile updated successfully!');
        // Refresh user data
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
    { id: 'referrals', label: 'My Referrals', icon: '👥' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
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
      case 'earnings':
        return (
          <Earnings
            earningsData={earningsData}
            currency={currency}
            referralData={referralData}
          />
        );
      case 'referrals':
        return (
          <Referrals
            referralData={referralData}
            currency={currency}
            setActiveTab={setActiveTab}
          />
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
      </div>
    </>
  );
};

export default Profile;
