import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Referrals = ({ referralData, currency, setActiveTab, userData, backendUrl, getToken }) => {
  const [kycData, setKycData] = useState({});
  const [loadingKyc, setLoadingKyc] = useState({});

  // Fetch KYC data for each referral user
  const fetchKycData = async (userId) => {
    if (kycData[userId] || loadingKyc[userId]) return;
    
    setLoadingKyc(prev => ({ ...prev, [userId]: true }));
    try {
      const token = getToken();
      if (!token) return;
      
      const { data } = await axios.get(`${backendUrl}/api/kyc/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success && data.kyc) {
        setKycData(prev => ({ ...prev, [userId]: data.kyc }));
      }
    } catch (error) {
      // Silently handle errors for KYC fetching
    } finally {
      setLoadingKyc(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Fetch KYC data when referralData changes
  useEffect(() => {
    if (referralData && referralData.length > 0) {
      referralData.forEach(referral => {
        if (referral.userId || referral._id) {
          fetchKycData(referral.userId || referral._id);
        }
      });
    }
  }, [referralData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Referrals</h2>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm text-gray-500">{referralData.length} total referrals</span>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {referralData.length === 0 ? (
          <div className="p-6 sm:p-8 text-center">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Referrals Yet</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Start sharing your referral link to earn commissions!</p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
            >
              View Referral Code
            </button>
          </div>
        ) : (
          <>
            {/* Referral List */}
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Details</h3>
              
              {/* Mobile Card View */}
              <div className="block sm:hidden">
                <div className="space-y-4">
                  {referralData.map((referral, index) => {
                    const userId = referral.userId || referral._id;
                    const userKyc = kycData[userId];
                    const isLoadingKyc = loadingKyc[userId];
                    
                    return (
                      <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-rose-600 font-medium text-base">
                              {referral.firstName?.charAt(0) || referral.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                              <div>
                                <p className="text-base font-semibold text-gray-900 truncate">
                                  {referral.firstName && referral.lastName 
                                    ? `${referral.firstName} ${referral.lastName}` 
                                    : referral.name || 'Anonymous'}
                                </p>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>
                                  <span className="font-medium">Email:</span> 
                                  <span className="ml-2 underline">
                                    {referral.email || 'Not provided'}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Phone:</span> 
                                  <span className="ml-2 underline">
                                    {isLoadingKyc ? (
                                      <span className="text-gray-400">Loading...</span>
                                    ) : userKyc?.phoneNumber ? (
                                      userKyc.phoneNumber
                                    ) : (
                                      'Not provided'
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Age:</span> 
                                  <span className="ml-2">
                                    {isLoadingKyc ? (
                                      <span className="text-gray-400">Loading...</span>
                                    ) : userKyc?.age ? (
                                      userKyc.age
                                    ) : (
                                      'Not provided'
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Join Date:</span> {new Date(referral.joinDate || referral.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Packages:</span> {referral.coursesBought || 0} packages
                                </div>
                                <div className="text-lg font-bold text-green-600">
                                  {currency} {Math.round(referral.commissionEarned || 0)} earned
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages Bought</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralData.map((referral, index) => {
                      const userId = referral.userId || referral._id;
                      const userKyc = kycData[userId];
                      const isLoadingKyc = loadingKyc[userId];
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-rose-600 font-medium text-sm">
                                  {referral.firstName?.charAt(0) || referral.name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="ml-3 lg:ml-4 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {referral.firstName && referral.lastName 
                                    ? `${referral.firstName} ${referral.lastName}` 
                                    : referral.name || 'Anonymous'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Age: {isLoadingKyc ? (
                                    <span className="text-gray-400">Loading...</span>
                                  ) : userKyc?.age ? (
                                    userKyc.age
                                  ) : (
                                    'Not provided'
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="space-y-1">
                              <div className="underline">
                                {referral.email || 'Email not provided'}
                              </div>
                              <div className="underline">
                                {isLoadingKyc ? (
                                  <span className="text-gray-400">Loading...</span>
                                ) : userKyc?.phoneNumber ? (
                                  userKyc.phoneNumber
                                ) : (
                                  'Phone not provided'
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(referral.joinDate || referral.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {referral.coursesBought || 0} packages
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {currency} {Math.round(referral.commissionEarned || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                <div className="text-gray-600">
                  Total Referrals: <span className="font-medium text-gray-900">{referralData.length}</span>
                </div>
                <div className="text-gray-600 mt-1 sm:mt-0">
                  Total Commission: <span className="font-medium text-green-600">
                    {currency} {Math.round(referralData.reduce((sum, ref) => sum + (ref.commissionEarned || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Referrals;