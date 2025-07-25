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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if id is valid
    if (!id) {
      toast.error("A valid course ID is required.")
      setLoading(false)
      return
    }

    const fetchCourse = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(
          `${backendUrl}/api/course/${id}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (data.success) {
          setCourseData(data.courseData)
        } else {
          toast.error(data.message || "Failed to load course data.")
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message || "Something went wrong.")
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [id, backendUrl, getToken])

  if (loading) return <Loading />

  if (!courseData) return <div className="text-center p-10">No course found.</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{courseData.courseTitle}</h1>
      <p>{courseData.courseDescription}</p>
    </div>
  )
}

export default CourseDetails
