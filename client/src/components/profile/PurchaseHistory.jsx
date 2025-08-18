import React from 'react';

const PurchaseHistory = ({ purchaseHistory, currency, navigate }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Course Purchase History</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {purchaseHistory.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase History</h3>
            <p className="text-gray-600 mb-4">You haven't purchased any courses yet.</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4 p-4">
              {purchaseHistory.map((purchase, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {purchase.courseId?.courseThumbnail ? (
                          <img
                            src={purchase.courseId.courseThumbnail}
                            alt={purchase.courseId.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <span className="text-white text-xs">📚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {purchase.courseId?.courseTitle || 'Course Not Available'}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium text-green-600">{currency}{Math.round(purchase.amount || 0)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {purchase.status || 'Completed'}
                        </span>
                      </div>
                    </div>

                    {purchase.transactionId && (
                      <div className="text-sm">
                        <span className="text-gray-600">Transaction ID:</span>
                        <p className="font-mono text-xs text-gray-900 break-all">{purchase.transactionId}</p>
                      </div>
                    )}

                    {purchase.referralCode && (
                      <div className="text-sm">
                        <span className="text-gray-600">Referral Code:</span>
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {purchase.referralCode}
                        </span>
                      </div>
                    )}

                    {purchase.paymentScreenshot && (
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          onClick={() => window.open(purchase.paymentScreenshot, '_blank')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          📷 View Payment Screenshot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseHistory.map((purchase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-16">
                            {purchase.courseId?.courseThumbnail ? (
                              <img
                                src={purchase.courseId.courseThumbnail}
                                alt={purchase.courseId.courseTitle}
                                className="h-12 w-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-12 w-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm">📚</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={purchase.courseId?.courseTitle}>
                              {purchase.courseId?.courseTitle || 'Course Not Available'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Course ID: {purchase.courseId?._id?.slice(-8) || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {currency}{Math.round(purchase.amount || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono max-w-32 truncate" title={purchase.transactionId}>
                          {purchase.transactionId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {purchase.referralCode ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {purchase.referralCode}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                          purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                          {purchase.status || 'Completed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {purchase.paymentScreenshot ? (
                          <button
                            onClick={() => window.open(purchase.paymentScreenshot, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </button>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Total Purchases: <span className="font-medium text-gray-900">{purchaseHistory.length}</span>
                </div>
                <div className="text-sm text-gray-600 mt-2 sm:mt-0">
                  Total Spent: <span className="font-medium text-green-600">
                    {currency}{Math.round(purchaseHistory.reduce((sum, purchase) => sum + (purchase.amount || 0), 0))}
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

export default PurchaseHistory;