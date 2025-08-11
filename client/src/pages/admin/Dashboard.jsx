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
        axios.get(`${backendUrl}/api/admin/purchased-users`, { headers: { Authorization: `Bearer ${token}` } }),
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

  // FIXED rejectPurchase to pass both userId and courseId
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

  const totalEnrollments = purchasesData.totalPurchases || 0
  const totalEarnings =
    purchasesData.purchases?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

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
        </div>

        {/* Latest Orders - Card Layout */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Orders</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl">
            {cartsData.length === 0 && (
              <p className="text-center text-gray-600 col-span-full">No cart items found.</p>
            )}

            {cartsData.map((cart) =>
              cart.courses.map((courseItem) => {
                const {
                  course,
                  isValidated,
                  referralCode,
                  transactionId,
                  paymentScreenshot,
                } = courseItem

                return (
                  <div
                    key={`${cart.user._id}-${course._id}`}
                    className="bg-white shadow-md rounded-md p-4 border border-gray-300 flex flex-col"
                  >
                    <h3 className="text-lg font-semibold mb-2">{course.courseTitle || 'Untitled Course'}</h3>

                    <p>
                      <span className="font-semibold">Student:</span> {cart.user.firstName} {cart.user.lastName}
                    </p>

                    <p>
                      <span className="font-semibold">Price:</span> {currency}
                      {course.coursePrice?.toFixed(2) || '0.00'}
                    </p>

                    <p>
                      <span className="font-semibold">Referral Code:</span> {referralCode || '-'}
                    </p>

                    <p className="break-words">
                      <span className="font-semibold">Transaction ID:</span> {transactionId || '-'}
                    </p>

                    <p>
                      <span className="font-semibold">Payment Screenshot:</span>{' '}
                      {paymentScreenshot ? (
                        <button
                          className="text-blue-600 underline cursor-pointer"
                          onClick={() => setModalImage(paymentScreenshot)}
                          type="button"
                        >
                          View Image
                        </button>
                      ) : (
                        '-'
                      )}
                    </p>

                    <p className="mt-2">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={isValidated ? 'text-green-600' : 'text-yellow-600'}>
                        {isValidated ? 'Completed' : 'Pending'}
                      </span>
                    </p>

                    {!isValidated && (
                      <div className="mt-4 flex gap-3">
                        <button
                          disabled={validatingIds.includes(course._id)}
                          onClick={() => validatePurchase(cart.user._id, course._id)}
                          className={`px-4 py-2 rounded text-white ${
                            validatingIds.includes(course._id)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {validatingIds.includes(course._id) ? 'Validating...' : 'Validate'}
                        </button>

                        <button
                          disabled={validatingIds.includes(course._id)}
                          onClick={() => rejectPurchase(cart.user._id, course._id)}
                          className={`px-4 py-2 rounded text-white ${
                            validatingIds.includes(course._id)
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {validatingIds.includes(course._id) ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    )}

                    {isValidated && (
                      <span className="mt-4 text-green-600 font-semibold">Validated</span>
                    )}
                  </div>
                )
              })
            )}
          </div>
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
                  className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                    makingAdmin
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



