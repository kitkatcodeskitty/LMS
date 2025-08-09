import React, { useEffect, useState, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/users/Loading'

const CourseDetails = () => {
  const { id } = useParams()
  const { backendUrl, getToken } = useContext(AppContext)
  const [courseData, setCourseData] = useState(null)
  const [purchasedUsers, setPurchasedUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      toast.error("A valid course ID is required.")
      setLoading(false)
      return
    }

    const fetchCourseDetails = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(
          `${backendUrl}/api/admin/purchased-users`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (data.success && Array.isArray(data.purchases)) {
          // Filter by course ID
          const filteredPurchases = data.purchases.filter(
            (p) => p.courseId?._id === id
          )

          if (filteredPurchases.length > 0) {
            setCourseData(filteredPurchases[0].courseId)
            setPurchasedUsers(filteredPurchases.map(p => p.userId))
          } else {
            toast.info("No purchases found for this course.")
          }
        } else {
          toast.error(data.message || "Failed to load course data.")
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [id, backendUrl, getToken])

  if (loading) return <Loading />

  if (!courseData) return <div className="text-center p-10">No course found.</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{courseData.courseTitle}</h1>
      <p className="mb-4">Price: ${courseData.coursePrice}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Purchased By:</h2>
      {purchasedUsers.length > 0 ? (
        <ul className="list-disc pl-6">
          {purchasedUsers.map((user) => (
            <li key={user._id}>
              {user.firstName} {user.lastName} - {user.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>No users have purchased this course.</p>
      )}
    </div>
  )
}

export default CourseDetails
