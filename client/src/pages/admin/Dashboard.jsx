import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/users/Loading'
import { formatDateTime } from '../../utils/formatters'
import axios from 'axios'



const Dashboard = () => {
  const { currency, backendUrl, isEducator, getToken, userData } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [purchasesData, setPurchasesData] = useState(null)
  const [cartsData, setCartsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [validatingIds, setValidatingIds] = useState([])
  const [modalImage, setModalImage] = useState(null) // For modal image display

  // New state for make user admin functionality
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [makingAdmin, setMakingAdmin] = useState(false)
  
  // New state for make user sub-admin functionality
  const [showMakeSubAdminModal, setShowMakeSubAdminModal] = useState(false)
  const [subAdminEmail, setSubAdminEmail] = useState('')
  const [makingSubAdmin, setMakingSubAdmin] = useState(false)

  // New state for profile edit restriction management
  const [showProfileRestrictionModal, setShowProfileRestrictionModal] = useState(false)
  const [restrictionEmail, setRestrictionEmail] = useState('')
  const [resettingRestriction, setResettingRestriction] = useState(false)

  const fetchDashboardAndPurchases = async () => {
    try {
      const token = await getToken()

      const [dashRes, purchasesRes, cartsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/admin/enrolled-students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/cart/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (dashRes.data.success) {
        setDashboardData(dashRes.data.dashboardData);
      } else {
        console.error('Failed to fetch dashboard data:', dashRes.data.message);
      }

      if (purchasesRes.data.success) {
        setPurchasesData(purchasesRes.data);
      } else {
        console.error('Failed to fetch purchases data:', purchasesRes.data.message);
      }

      if (cartsRes.data.success) setCartsData(cartsRes.data.carts)
      else console.error('Failed to fetch cart data:', cartsRes.data.message)
    } catch (error) {
      console.error('Error fetching data:', error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEducator || userData?.isSubAdmin || userData?.role === 'subadmin') {
      fetchDashboardAndPurchases()
    } else {
      setLoading(false)
    }
  }, [isEducator, userData])

  const validatePurchase = async (userId, courseId) => {
    try {
      setValidatingIds((prev) => [...prev, courseId])
      const token = await getToken()

      const res = await axios.put(
        `${backendUrl}/api/cart/validate`,
        { userId, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        console.log('Purchase validated successfully.')

        setCartsData((prevCarts) =>
          prevCarts
            .map((cart) => {
              if (cart.user._id === userId) {
                return {
                  ...cart,
                  courses: cart.courses.filter((item) => item.course._id !== courseId),
                }
              }
              return cart
            })
            .filter((cart) => cart.courses.length > 0)
        )
      } else {
        console.error('Failed to validate purchase:', res.data.message)
      }
    } catch (error) {
      console.error('Error validating purchase:', error.response?.data?.message || error.message)
    } finally {
      setValidatingIds((prev) => prev.filter((id) => id !== courseId))
    }
  }

  // reject purchase
  const rejectPurchase = async (userId, courseId) => {
    try {
      setValidatingIds((prev) => [...prev, courseId])
      const token = await getToken()

      const res = await axios.put(
        `${backendUrl}/api/cart/reject`,
        { userId, courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        console.log('Purchase rejected successfully.')

        setCartsData((prevCarts) =>
          prevCarts
            .map((cart) => {
              if (cart.user._id === userId) {
                return {
              ...cart,
              courses: cart.courses.filter((item) => item.course._id !== courseId),
                }
              }
              return cart
            })
            .filter((cart) => cart.courses.length > 0)
        )
      } else {
        console.error(res.data.message || 'Failed to reject purchase.')
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message || 'Error rejecting purchase.')
    } finally {
      setValidatingIds((prev) => prev.filter((id) => id !== courseId))
    }
  }

  // Reset profile edit restriction for a user
  const resetProfileEditRestriction = async (e) => {
    e.preventDefault()
    try {
      setResettingRestriction(true)
      const token = await getToken()

      // First, find the user by email to get their ID
      const userRes = await axios.get(`${backendUrl}/api/users/${restrictionEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!userRes.data._id) {
        console.error('User not found with this email address.')
        return
      }

      const userId = userRes.data._id

      // Reset the profile edit restriction
      const res = await axios.post(
        `${backendUrl}/api/users/reset-profile-edit-restriction`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        console.log('Profile edit restriction has been reset for this user.')
        setShowProfileRestrictionModal(false)
        setRestrictionEmail('')
      } else {
        console.error(res.data.message || 'Failed to reset profile edit restriction.')
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message || 'Error resetting profile edit restriction.')
    } finally {
      setResettingRestriction(false)
    }
  }

  // Make user admin function
  const makeUserAdmin = async (e) => {
    e.preventDefault()

    if (!adminEmail.trim()) {
      console.error('Please enter an email address')
      return
    }

    try {
      setMakingAdmin(true)
      const token = await getToken()

      const res = await axios.post(
        `${backendUrl}/api/admin/make-user-admin`,
        { email: adminEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        console.log(res.data.message)
        setAdminEmail('')
        setShowMakeAdminModal(false)
      } else {
        console.error(res.data.message || 'Failed to make user admin.')
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message || 'Error making user admin.')
    } finally {
      setMakingAdmin(false)
    }
  }

  // Make user sub-admin function
  const makeUserSubAdmin = async (e) => {
    e.preventDefault()

    if (!subAdminEmail.trim()) {
      console.error('Please enter an email address')
      return
    }

    try {
      setMakingSubAdmin(true)
      const token = await getToken()

      const res = await axios.post(
        `${backendUrl}/api/users/make-sub-admin`,
        { email: subAdminEmail.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        console.log(res.data.message)
        setSubAdminEmail('')
        setShowMakeSubAdminModal(false)
      } else {
        console.error(res.data.message || 'Failed to make user sub-admin.')
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message || 'Error making user sub-admin.')
    } finally {
      setMakingSubAdmin(false)
    }
  }

  if (loading) return <Loading />

  if (!isEducator && !userData?.isSubAdmin && userData?.role !== 'subadmin') {
    return (
      <div className="p-8 text-center text-gray-600">
        You must be an admin to view the dashboard.
      </div>
    )
  }

  if (!dashboardData || !purchasesData) {
    return (
      <div className="p-8 text-center text-gray-600">
        No dashboard data available.
      </div>
    )
  }

  const totalEnrollments = purchasesData.totalStudents || 0

  return (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="space-y-5">
        {/* Admin Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-medium text-gray-800">
            {isEducator ? 'Admin Dashboard' : 'Sub-Admin Dashboard'}
          </h1>

          {isEducator && (
          <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowProfileRestrictionModal(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Manage Profile Restrictions
              </button>
            <button
              onClick={() => setShowMakeSubAdminModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Make Sub-Admin
            </button>
            <button
              onClick={() => setShowMakeAdminModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Make Full Admin
            </button>
          </div>
          )}
        </div>



        {/* Financial Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Financial Summary
          </h3>
          

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {currency}{Math.round(dashboardData.totalRevenue) || '0'}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-xs text-gray-500 mt-1">100% of all course sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {currency}{Math.round(dashboardData.totalProfit) || '0'}
              </div>
              <div className="text-sm text-gray-600">Your Profit</div>
              <div className="text-xs text-gray-500 mt-1">{dashboardData.profitPercentage || '0%'} of revenue</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {currency}{Math.round(dashboardData.totalAffiliateOutflow) || '0'}
              </div>
              <div className="text-sm text-gray-600">Affiliate Payouts</div>
              <div className="text-xs text-gray-500 mt-1">{dashboardData.affiliatePercentage || '0%'} of revenue</div>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> When users purchase with referral codes, 60% goes to affiliates and 40% is your profit. 
              Without referrals, you keep 100% of the revenue.
            </p>
          </div>
        </div>

                 {/* Latest Enrolled Students - Table for Web, Cards for Mobile */}
         <div>
           <h2 className="pb-4 text-lg font-medium">Latest Enrolled Students</h2>
           
                       {/* Web View - Table */}
            <div className="hidden md:block">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Student</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Latest Course</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Total Spent</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Courses</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Referrals</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Latest Purchase</th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(!purchasesData.purchases || purchasesData.purchases.length === 0) ? (
                        <tr>
                          <td colSpan="7" className="px-3 py-4 text-center text-gray-600">No enrolled students found.</td>
                        </tr>
                      ) : (
                        purchasesData.purchases
                          .sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase))
                          .slice(0, 5)
                          .map((studentData) => {
                            const latestPurchase = studentData.purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                            
                            return (
                              <tr key={studentData.userDetails._id} className="hover:bg-gray-50">
                                <td className="px-3 py-4">
                                  <div className="flex items-center min-w-0">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      {studentData.userDetails?.imageUrl ? (
                                        <img className="h-10 w-10 rounded-full" src={studentData.userDetails.imageUrl} alt="Profile" />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                          <span className="text-sm font-medium text-gray-700">
                                            {studentData.userDetails?.firstName?.charAt(0)}{studentData.userDetails?.lastName?.charAt(0)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="ml-3 min-w-0 flex-1">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {studentData.userDetails?.firstName} {studentData.userDetails?.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500 truncate">{studentData.userDetails?.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <div className="text-sm text-gray-900 truncate" title={latestPurchase.courseId?.courseTitle}>
                                    {latestPurchase.courseId?.courseTitle || 'Course Title Not Available'}
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <div className="text-sm font-semibold text-green-600">
                                    {currency}{Math.round(studentData.totalSpent) || '0'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Profit: {currency}{Math.round(studentData.totalSpent * 0.4) || '0'}
                                  </div>
                                </td>
                                <td className="px-3 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {studentData.totalCourses} Course{studentData.totalCourses > 1 ? 's' : ''}
                                  </span>
                                </td>
                                <td className="px-3 py-4">
                                  <div className="text-sm text-gray-900">{studentData.referralCount || 0}</div>
                                  {studentData.userDetails?.affiliateCode && (
                                    <div className="text-xs text-gray-500 font-mono truncate" title={studentData.userDetails.affiliateCode}>
                                      {studentData.userDetails.affiliateCode}
                                    </div>
                                  )}
                                </td>
                                <td className="px-3 py-4">
                                  <div className="text-sm text-gray-900 truncate">{formatDateTime(latestPurchase.createdAt)}</div>
                                  <div className="text-xs text-gray-500 truncate">{formatDateTime(studentData.firstPurchase)}</div>
                                </td>
                                <td className="px-3 py-4 text-sm font-medium">
                                  <div className="flex flex-col space-y-1">
                                    {latestPurchase.paymentScreenshot && (
                                      <button
                                        className="text-blue-600 hover:text-blue-900 text-xs"
                                        onClick={() => setModalImage(latestPurchase.paymentScreenshot)}
                                      >
                                        📷 Screenshot
                                      </button>
                                    )}
                                    <button
                                      className="text-green-600 hover:text-green-900 text-xs"
                                      onClick={() => {
                                        // You can implement view details functionality here
                                        console.info(`View details for ${studentData.userDetails?.firstName} ${studentData.userDetails?.lastName}`)
                                      }}
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

           {/* Mobile View - Cards */}
           <div className="md:hidden">
             <div className="grid grid-cols-1 gap-4">
               {(!purchasesData.purchases || purchasesData.purchases.length === 0) && (
                 <p className="text-center text-gray-600">No enrolled students found.</p>
               )}

               {purchasesData.purchases && purchasesData.purchases
                 .sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase))
                 .slice(0, 5)
                 .map((studentData) => {
                   const latestPurchase = studentData.purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

                   return (
                     <div
                       key={studentData.userDetails._id}
                       className="bg-white shadow-lg rounded-lg p-4 border border-gray-200"
                     >
                       {/* Header with Status Badge */}
                       <div className="flex justify-between items-start mb-3">
                         <div className="flex-1">
                           <h3 className="text-lg font-semibold text-gray-900 mb-1">
                             {studentData.userDetails?.firstName} {studentData.userDetails?.lastName}
                           </h3>
                           <p className="text-sm text-gray-500">{studentData.userDetails?.email}</p>
                         </div>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           {studentData.totalCourses} Course{studentData.totalCourses > 1 ? 's' : ''}
                         </span>
                       </div>

                       {/* Course Information - Latest Purchase */}
                       <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                         <h4 className="font-medium text-gray-900 mb-2">
                           Latest: {latestPurchase.courseId?.courseTitle || 'Course Title Not Available'}
                         </h4>
                         <div className="flex justify-between items-center">
                           <span className="text-lg font-bold text-green-600">
                             Total: {currency}{Math.round(studentData.totalSpent) || '0'}
                           </span>
                           <span className="text-xs text-gray-500">
                             {formatDateTime(latestPurchase.createdAt)}
                           </span>
                         </div>
                       </div>

                       {/* Student Stats */}
                       <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                           <span className="font-medium text-gray-700">Total Courses:</span>
                           <span className="text-gray-900 font-medium">
                             {studentData.totalCourses}
                           </span>
                         </div>

                         <div className="flex justify-between">
                           <span className="font-medium text-gray-700">Total Spent:</span>
                           <span className="text-green-600 font-medium">
                             {currency}{Math.round(studentData.totalSpent) || '0'}
                           </span>
                         </div>

                         {/* Financial Breakdown */}
                         <div className="mt-3 p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                           <div className="text-xs font-medium text-gray-700 mb-2">Financial Breakdown:</div>
                           <div className="space-y-1">
                             <div className="flex justify-between text-xs">
                               <span className="text-gray-600">Revenue:</span>
                               <span className="text-blue-600 font-medium">
                                 {currency}{Math.round(studentData.totalSpent) || '0'}
                               </span>
                             </div>
                             <div className="flex justify-between text-xs">
                               <span className="text-gray-600">Your Profit:</span>
                               <span className="text-green-600 font-medium">
                                 {currency}{Math.round(studentData.totalSpent * 0.4) || '0'}
                               </span>
                             </div>
                             <div className="flex justify-between text-xs">
                               <span className="text-gray-600">Affiliate (if any):</span>
                               <span className="text-orange-600 font-medium">
                                 {currency}{Math.round(studentData.totalSpent * 0.6) || '0'}
                               </span>
                             </div>
                           </div>
                         </div>

                         <div className="flex justify-between">
                           <span className="font-medium text-gray-700">Referrals Made:</span>
                           <span className="text-orange-600 font-medium">
                             {studentData.referralCount || 0}
                           </span>
                         </div>

                         {studentData.userDetails?.affiliateCode && (
                           <div className="flex justify-between">
                             <span className="font-medium text-gray-700">Affiliate Code:</span>
                             <span className="text-blue-600 font-medium">
                               {studentData.userDetails.affiliateCode}
                             </span>
                           </div>
                         )}

                         <div className="flex justify-between">
                           <span className="font-medium text-gray-700">Latest Transaction:</span>
                           <span className="text-gray-900 text-right break-all max-w-32" title={latestPurchase.transactionId}>
                             {latestPurchase.transactionId || 'N/A'}
                           </span>
                         </div>

                         <div className="flex justify-between">
                           <span className="font-medium text-gray-700">Status:</span>
                           <span className="text-green-600 font-medium capitalize">
                             Active Student
                           </span>
                         </div>
                       </div>

                       {/* Payment Screenshot */}
                       {latestPurchase.paymentScreenshot && (
                         <div className="mt-4 pt-3 border-t border-gray-200">
                           <button
                             className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 px-3 rounded-md transition-colors text-sm font-medium"
                             onClick={() => setModalImage(latestPurchase.paymentScreenshot)}
                             type="button"
                           >
                             📷 View Latest Payment Screenshot
                           </button>
                         </div>
                       )}

                       {/* Enrollment Date Footer */}
                       <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                         <span className="text-xs text-gray-500">
                           First enrolled: {formatDateTime(studentData.firstPurchase)} • Latest: {formatDateTime(studentData.lastPurchase)}
                         </span>
                       </div>
                     </div>
                   )
                 })}
             </div>
           </div>

          {/* Show More Button */}
          {purchasesData.purchases && purchasesData.purchases.length > 5 && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  // You can implement a "show more" functionality here
                  // For now, we'll just show a message
                  console.info(`Showing latest 5 students out of ${purchasesData.purchases.length} total students`)
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-md transition-colors"
              >
                View All Students ({purchasesData.purchases.length})
              </button>
            </div>
          )}
        </div>


      </div>

      {/* Modal for Payment Screenshot */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          <img
            src={modalImage}
            alt="Payment Screenshot"
            className="max-w-[90vw] max-h-[80vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Admin-only Modals - Only visible to full admins */}
      {isEducator && (
        <>
      {/* Modal for Making User Admin */}
      {showMakeAdminModal && (
        <div
          onClick={() => setShowMakeAdminModal(false)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Make User Full Admin</h2>
            <p className="text-sm text-gray-600 mb-4">Full admins have access to all admin features including dashboard and course management.</p>

            <form onSubmit={makeUserAdmin} className="space-y-4">
              <div>
                <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  User Email Address
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter user's email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMakeAdminModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={makingAdmin}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${makingAdmin
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {makingAdmin ? 'Making Admin...' : 'Make Full Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Making User Sub-Admin */}
      {showMakeSubAdminModal && (
        <div
          onClick={() => setShowMakeSubAdminModal(false)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Make User Sub-Admin</h2>
            <p className="text-sm text-gray-600 mb-4">Sub-admins can manage students, pending orders, and KYC reviews but cannot access dashboard or add courses.</p>

            <form onSubmit={makeUserSubAdmin} className="space-y-4">
              <div>
                <label htmlFor="subAdminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  User Email Address
                </label>
                <input
                  type="email"
                  id="subAdminEmail"
                  value={subAdminEmail}
                  onChange={(e) => setSubAdminEmail(e.target.value)}
                  placeholder="Enter user's email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMakeSubAdminModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={makingSubAdmin}
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${makingSubAdmin
                      ? 'bg-green-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {makingSubAdmin ? 'Making Sub-Admin...' : 'Make Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
          )}

          {/* Modal for Managing Profile Edit Restrictions */}
          {showProfileRestrictionModal && (
            <div
              onClick={() => setShowProfileRestrictionModal(false)}
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Manage Profile Edit Restrictions</h2>
                <p className="text-sm text-gray-600 mb-4">Reset profile edit restrictions for users who need to make additional changes to their profiles.</p>

                <form onSubmit={resetProfileEditRestriction} className="space-y-4">
                  <div>
                    <label htmlFor="restrictionEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      User Email Address
                    </label>
                    <input
                      type="email"
                      id="restrictionEmail"
                      value={restrictionEmail}
                      onChange={(e) => setRestrictionEmail(e.target.value)}
                      placeholder="Enter user's email address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowProfileRestrictionModal(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resettingRestriction}
                      className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${resettingRestriction
                          ? 'bg-amber-400 cursor-not-allowed'
                          : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                    >
                      {resettingRestriction ? 'Resetting...' : 'Reset Restriction'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Dashboard



