import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/users/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
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

  const fetchDashboardAndPurchases = async () => {
    try {
      const token = await getToken()

      const [dashRes, purchasesRes, cartsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/admin/enrolled-students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/cart/all`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (dashRes.data.success) setDashboardData(dashRes.data.dashboardData)
      else toast.error(dashRes.data.message || 'Failed to fetch dashboard data.')

      if (purchasesRes.data.success) setPurchasesData(purchasesRes.data)
      else toast.error(purchasesRes.data.message || 'Failed to fetch purchases data.')

      if (cartsRes.data.success) setCartsData(cartsRes.data.carts)
      else toast.error(cartsRes.data.message || 'Failed to fetch cart data.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error fetching data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchDashboardAndPurchases()
    } else {
      setLoading(false)
    }
  }, [isEducator])

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
        toast.success('Purchase validated successfully.')

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
        toast.error(res.data.message || 'Failed to validate purchase.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error validating purchase.')
    } finally {
      setValidatingIds((prev) => prev.filter((id) => id !== courseId))
    }
  }

  // reject purchase
  const rejectPurchase = async (userId, courseId) => {
    try {
      setValidatingIds((prev) => [...prev, courseId])
      const token = await getToken()

      const res = await axios.delete(
        `${backendUrl}/api/cart/reject`,
        {
          data: { userId, courseId },
          headers: { Authorization: `Bearer ${token}` },
        }
      )


      if (res.data.success) {
        toast.success('Course rejected and removed from cart.')

        setCartsData((prevCarts) =>
          prevCarts
            .map((cart) => ({
              ...cart,
              courses: cart.courses.filter((item) => item.course._id !== courseId),
            }))
            .filter((cart) => cart.courses.length > 0)
        )
      } else {
        toast.error(res.data.message || 'Failed to reject course.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error rejecting course.')
    } finally {
      setValidatingIds((prev) => prev.filter((id) => id !== courseId))
    }
  }

  // Make user admin function
  const makeUserAdmin = async (e) => {
    e.preventDefault()

    if (!adminEmail.trim()) {
      toast.error('Please enter an email address')
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
        toast.success(res.data.message)
        setAdminEmail('')
        setShowMakeAdminModal(false)
      } else {
        toast.error(res.data.message || 'Failed to make user admin.')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error making user admin.')
    } finally {
      setMakingAdmin(false)
    }
  }

  if (loading) return <Loading />

  if (!isEducator) {
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
  const totalEarnings =
    purchasesData.purchases?.reduce((sum, studentData) => sum + (studentData.totalSpent || 0), 0) || 0

  // Debug: Log the purchases data structure
  console.log('Purchases Data:', purchasesData)
  console.log('Total Students:', purchasesData.purchases?.length || 0)

  // Calculate total profit based on referral status
  const totalProfit = purchasesData.purchases?.reduce((sum, studentData) => {
    const studentProfit = studentData.purchases?.reduce((studentSum, purchase) => {
      // Get course price from the purchase amount or courseId price
      const coursePrice = purchase.amount || purchase.courseId?.price || purchase.courseId?.coursePrice || 0
      
      // Check if user used a referral code when purchasing
      // Based on your Purchase.js model, check referralCode and referrerId
      const hasReferral = (purchase.referralCode && purchase.referralCode !== null && purchase.referralCode !== '') || 
                         (purchase.referrerId && purchase.referrerId !== null)
      
      // Profit calculation:
      // - If user used a referral when buying: profit = half of course price (50%)
      // - If user did NOT use a referral: profit = full course price (100%)
      const profit = hasReferral ? (coursePrice * 0.5) : coursePrice
      
      return studentSum + profit
    }, 0) || 0
    return sum + studentProfit
  }, 0) || 0

  return (
    <div className="min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="space-y-5">
        {/* Make User Admin Button */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-medium text-gray-800">Admin Dashboard</h1>
          <button
            onClick={() => setShowMakeAdminModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Make User Admin
          </button>
        </div>

        <div className="flex flex-wrap gap-5 items-center">
          {/* Total Enrollments */}
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-28">
            <img
              className="w-10 h-10 object-contain"
              src={assets.patients_icon}
              alt="patient_icon"
            />
            <div>
              <p className="text-2xl font-medium text-gray-600">{totalEnrollments}</p>
              <p className="text-base text-gray-500">Total Enrollments</p>
            </div>
          </div>

          {/* Total Courses */}
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-28">
            <img
              className="w-10 h-10 object-contain"
              src={assets.appointments_icon}
              alt="course_icon"
            />
            <div>
              <p className="text-2xl font-medium text-gray-600">{dashboardData.totalCourses}</p>
              <p className="text-base text-gray-500">Total Courses</p>
            </div>
          </div>

          {/* Total Earnings */}
          <div className="flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-28">
            <img
              className="w-10 h-10 object-contain"
              src={assets.earning_icon}
              alt="earning_icon"
            />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {currency}
                {totalEarnings.toFixed(2)}
              </p>
              <p className="text-base text-gray-500">Total Earnings</p>
            </div>
          </div>

          {/* Total Profit */}
          <div className="flex items-center gap-3 shadow-card border border-green-500 p-4 w-56 rounded-md h-28">
            <img
              className="w-10 h-10 object-contain"
              src={assets.earning_icon}
              alt="profit_icon"
            />
            <div>
              <p className="text-2xl font-medium text-gray-600">
                {currency}
                {totalProfit.toFixed(2)}
              </p>
              <p className="text-base text-gray-500">Total Profit</p>
            </div>
          </div>
        </div>

        {/* Latest Enrolled Students - Card Layout */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrolled Students</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
            {(!purchasesData.purchases || purchasesData.purchases.length === 0) && (
              <p className="text-center text-gray-600 col-span-full">No enrolled students found.</p>
            )}

            {purchasesData.purchases && purchasesData.purchases
              .sort((a, b) => new Date(b.lastPurchase) - new Date(a.lastPurchase))
              .slice(0, 12)
              .map((studentData) => {
                const latestPurchase = studentData.purchases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
                const formatDate = (dateString) => {
                  return new Date(dateString).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }

                return (
                  <div
                    key={studentData.userDetails._id}
                    className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Header with Status Badge */}
                    <div className="flex justify-between items-start mb-4">
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
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Latest: {latestPurchase.courseId?.courseTitle || 'Course Title Not Available'}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          Total: {currency}{studentData.totalSpent?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(latestPurchase.createdAt)}
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
                          {currency}{studentData.totalSpent?.toFixed(2) || '0.00'}
                        </span>
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
                        First enrolled: {formatDate(studentData.firstPurchase)} • Latest: {formatDate(studentData.lastPurchase)}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Show More Button */}
          {purchasesData.purchases && purchasesData.purchases.length > 12 && (
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  // You can implement a "show more" functionality here
                  // For now, we'll just show a message
                  toast.info(`Showing latest 12 students out of ${purchasesData.purchases.length} total students`)
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
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Make User Admin</h2>

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
                  {makingAdmin ? 'Making Admin...' : 'Make Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard



