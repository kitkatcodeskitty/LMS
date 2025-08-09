import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/users/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'
import UpdateCoursePopup from '../../components/users/UpdateCoursePopup' 

const MyCourse = () => {
  const { backendUrl, getToken, isEducator } = useContext(AppContext)
  const [courses, setCourses] = useState(null)
  const [loading, setLoading] = useState(false) // delete loading
  const [showUpdatePopup, setShowUpdatePopup] = useState(false)
  const [courseToUpdate, setCourseToUpdate] = useState(null)

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(`${backendUrl}/api/course/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.success) {
        setCourses(data.courses)
      } else {
        toast.error('Failed to fetch courses. Server error.')
      }
    } catch (error) {
      toast.error('Failed to fetch courses. Please try again later.')
    }
  }

  useEffect(() => {
    if (isEducator) {
      fetchEducatorCourses()
    }
  }, [isEducator])

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return

    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await axios.delete(
        `${backendUrl}/api/course/delete-course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      if (data.success) {
        toast.success('Course deleted successfully')
        setCourses((prev) => prev.filter((course) => course._id !== courseId))
      } else {
        toast.error(data.message || 'Failed to delete course')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error deleting course')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateClick = (course) => {
    setCourseToUpdate(course)
    setShowUpdatePopup(true)
  }

  const handlePopupClose = () => {
    setShowUpdatePopup(false)
    setCourseToUpdate(null)
  }

  const handleCourseUpdate = (updatedCourse) => {
    setCourses((prev) =>
      prev.map((course) => (course._id === updatedCourse._id ? updatedCourse : course))
    )
  }

  if (!courses) {
    return <Loading />
  }

  return (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full">
        <h2 className="pb-4 text-lg font-medium">My Courses</h2>
        <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">All Courses</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">
                  Published On
                </th>
                <th className="px-4 py-3 font-semibold truncate">Update</th>
                <th className="px-4 py-3 font-semibold truncate">Delete</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-gray-500/20">
                  <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                    <img src={course.courseThumbnail} alt="course image" className="w-16" />
                    <span className="truncate hidden md:block">{course.courseTitle}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleUpdateClick(course)}
                      className="text-blue-500 hover:underline"
                    >
                      Update
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={loading}
                      className={`text-red-500 hover:underline ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show update popup */}
        {showUpdatePopup && courseToUpdate && (
          <UpdateCoursePopup
            course={courseToUpdate}
            onClose={handlePopupClose}
            onUpdate={handleCourseUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default MyCourse
