import React from 'react';

const Referrals = ({ referralData, currency, setActiveTab }) => {
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
            {/* Mobile Card View */}
            <div className="block sm:hidden">
              <div className="divide-y divide-gray-200">
                {referralData.map((referral, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-rose-600 font-medium text-sm">
                          {referral.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{referral.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500 truncate">{referral.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Joined: {new Date(referral.joinDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <p className="text-sm font-medium text-green-600">{currency}{Math.round(referral.commissionEarned || 0)}</p>
                            <p className="text-xs text-gray-500">{referral.coursesBought || 0} courses</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courses Bought</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralData.map((referral, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-rose-600 font-medium text-sm">
                              {referral.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="ml-3 lg:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{referral.name || 'Anonymous'}</div>
                            <div className="text-sm text-gray-500 truncate">{referral.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(referral.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {referral.coursesBought || 0}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {currency}{Math.round(referral.commissionEarned || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
                <div className="text-gray-600">
                  Total Referrals: <span className="font-medium text-gray-900">{referralData.length}</span>
                </div>
                <div className="text-gray-600 mt-1 sm:mt-0">
                  Total Commission: <span className="font-medium text-green-600">
                    {currency}{Math.round(referralData.reduce((sum, ref) => sum + (ref.commissionEarned || 0), 0))}
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