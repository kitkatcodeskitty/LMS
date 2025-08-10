import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/users/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [purchasesData, setPurchasesData] = useState(null) // for total enrollments & earnings
  const [cartsData, setCartsData] = useState([]) // only for cart table and validation
  const [loading, setLoading] = useState(true)
  const [validatingIds, setValidatingIds] = useState([]) // track validating course IDs

  const fetchDashboardAndPurchases = async () => {
    try {
      const token = await getToken()

      // Fetch dashboard
      const dashRes = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch purchases (for total enrollments and earnings cards)
      const purchasesRes = await axios.get(`${backendUrl}/api/admin/purchased-users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Fetch carts (for the table)
      const cartsRes = await axios.get(`${backendUrl}/api/cart/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

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

        {/* Cart Items Table */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Order</h2>
          <div className="flex flex-col items-center max-w-6xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                  <th className="px-4 py-3 font-semibold">Course Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {cartsData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-600">
                      No cart items found.
                    </td>
                  </tr>
                )}

                {cartsData.map((cart, cartIndex) =>
                  cart.courses.map((courseItem, courseIndex) => {
                    const { course, isValidated } = courseItem
                    const statusText = isValidated ? 'Completed' : 'Pending'
                    const isLoading = validatingIds.includes(course._id)

                    return (
                      <tr key={`${cart.user._id}-${course._id}`} className="border-b border-gray-500/20">
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          {cartIndex + 1}.{courseIndex + 1}
                        </td>
                        <td className="md:px-4 px-2 py-3">
                          {cart.user.firstName} {cart.user.lastName}
                        </td>
                        <td className="px-4 py-3">{course.courseTitle || 'Untitled Course'}</td>
                        <td className="px-4 py-3">
                          {currency}
                          {course.coursePrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-3">{statusText}</td>
                        <td className="px-4 py-3 max-sm:text-right">
                          {!isValidated ? (
                            <button
                              disabled={isLoading}
                              onClick={() => validatePurchase(cart.user._id, course._id)}
                              className={`px-3 sm:px-5 py-1.5 sm:py-2 text-white ${
                                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                              } max-sm:text-xs rounded`}
                            >
                              {isLoading ? 'Validating...' : 'Validate'}
                            </button>
                          ) : (
                            <span className="text-green-600 font-semibold">Validated</span>
                          )}
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
    </div>
  )
}

export default Dashboard
