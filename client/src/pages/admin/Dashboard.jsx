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
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()

      // Fetch educator dashboard data
      const { data } = await axios.get(`${backendUrl}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Fetch purchases data
      const purchasesRes = await axios.get(`http://localhost:5000/api/admin/purchased-users`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setDashboardData(data.dashboardData)
      } else {
        toast.error(data.message || 'Failed to fetch dashboard data.')
      }

      if (purchasesRes.data.success) {
        setPurchasesData(purchasesRes.data)
      } else {
        toast.error(purchasesRes.data.message || 'Failed to fetch purchases data.')
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Error fetching dashboard data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [isEducator])

  if (loading) return <Loading />

  if (!isEducator) {
    return (
      <div className="p-8 text-center text-gray-600">
        You must be an educator to view the dashboard.
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

  // Calculate totals from purchases
  const totalEnrollments = purchasesData.totalPurchases || 0
  const totalEarnings = purchasesData.purchases?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0

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
              <p className="text-2xl font-medium text-gray-600">
                {totalEnrollments}
              </p>
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
              <p className="text-2xl font-medium text-gray-600">
                {dashboardData.totalCourses}
              </p>
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
                {currency}{totalEarnings}
              </p>
              <p className="text-base text-gray-500">Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Latest Enrolments */}
        <div>
          <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed md:table-auto w-full overflow-hidden">
              <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">
                    #
                  </th>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Course Title</th>
                  <th className="px-4 py-3 font-semibold">Course Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-500">
                {purchasesData.purchases?.map((purchase, index) => (
                  <tr key={purchase._id} className="border-b border-gray-500/20">
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      {index + 1}
                    </td>
                    <td className="md:px-4 px-2 py-3">
                      {purchase.userId?.firstName} {purchase.userId?.lastName}
                    </td>
                    <td className="px-4 py-3">{purchase.courseId?.courseTitle || "Course not found"} </td>
                    <td className="px-4 py-3">{currency}{purchase.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
