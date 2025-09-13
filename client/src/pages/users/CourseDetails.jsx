import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/users/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/users/Footer'
import { calculateDiscountedPrice } from '../../utils/priceUtils'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { getProtectedYouTubeUrl, videoProtectionStyles } from '../../utils/videoProtection'

const PackageDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSection] = useState({})
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(null)

  const {
    currency,
    userData,
    backendUrl,
    getToken,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext)

  const fetchCourseData = async () => {
    try {
      const token = getToken()
      if (token) {
        const authRes = await fetch(`${backendUrl}/api/cart/get-purchased-course-details/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (authRes.ok) {
          const authData = await authRes.json()
          setCourseData(authData)
          const enrolledByServer = authData?.isPurchased === true
          const enrolledByClient = !!(userData && authData?._id && userData.enrolledCourses?.includes(authData._id))
          setIsAlreadyEnrolled(enrolledByServer || enrolledByClient)
          return
        }
      }

      const res = await fetch(`${backendUrl}/api/courses/${id}`)
      if (!res.ok) throw new Error(`Failed to fetch course. Status: ${res.status}`)
      const data = await res.json()
      
      if (data.success && data.course) {
        setCourseData(data.course)
      } else {
        throw new Error(data.message || 'Package not found')
      }
      setIsAlreadyEnrolled(false)
    } catch (error) {
      console.error('Failed to load package. ' + error.message)
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [id, userData])

  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const handlePreviewClick = (lectureUrl) => {
    try {
      const url = new URL(lectureUrl)
      const videoId = url.pathname.split('/').pop()
      setPlayerData({ videoId })
    } catch {
      console.error('Invalid video URL')
    }
  }

  const fixedRating = 4

  const enrolledCourse = () => {
    if (!userData) {
      navigate(`/payment/${courseData._id}`)
      return
    }

    if (userData.isAdmin) {
      console.info('Admins cannot enroll in packages.')
      return
    }

    if (!courseData) return

    navigate('/payment', {
      state: {
        courseId: courseData._id,
        courseTitle: courseData.courseTitle,
        coursePrice: calculateDiscountedPrice(courseData),
        currency,
      },
    })
  }



  if (!courseData) {
    return <Loading />
  }

  return (
    <>
      <style>{videoProtectionStyles}</style>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-red-100/70"></div>

        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>

          <p
            className="pt-4 md:text-base text-sm"
            dangerouslySetInnerHTML={{ __html: courseData.courseDescription?.slice(0, 200) }}
          ></p>

          <div className="flex items-center space-x-2 pt-3 pb-1 text-sm ">
            <p className="font-medium text-black">{fixedRating}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < fixedRating ? assets.star : assets.star_blank}
                  alt=""
                  className="w-4 h-4"
                />
              ))}
            </div>
            <p className="text-blue-600">
              ({courseData.courseRatings?.length || 0}{' '}
              {(courseData.courseRatings?.length || 0) > 1 ? 'ratings' : 'rating'})
            </p>
            <p>
              {courseData.enrolledStudents?.length || 0}{' '}
              {(courseData.enrolledStudents?.length || 0) > 1 ? 'students' : 'student'}
            </p>
          </div>
          <p>
            Package by{' '}
            <span className="text-blue-600 underline">
              {courseData.admin?.firstName} {courseData.admin?.lastName}
            </span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Package Structure</h2>

            <div className="pt-5">
              {courseData.courseContent?.map((chapter, index) => (
                <div key={index} className="border border-grey-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      {openSections[index] ? (
                        <FaChevronUp className="w-4 h-4 text-gray-600 transition-transform duration-200" />
                      ) : (
                        <FaChevronDown className="w-4 h-4 text-gray-600 transition-transform duration-200" />
                      )}
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent?.length || 0} Lectures - {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <ul className="list-disc md:pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent?.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img src={assets.play_icon} alt="play icon" className="w-4 h-4 mt-1" />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {isAlreadyEnrolled ? (
                                <p
                                  onClick={() => handlePreviewClick(lecture.lectureUrl)}
                                  className="text-green-600 cursor-pointer font-semibold"
                                >
                                  Watch
                                </p>
                              ) : lecture.isPreviewFree ? (
                                <p
                                  onClick={() => handlePreviewClick(lecture.lectureUrl)}
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Preview
                                </p>
                              ) : (
                                <p className="text-gray-400 cursor-not-allowed select-none">Locked</p>
                              )}
                              <p>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ['h', 'm'],
                                })}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Package Description</h3>
            <p
              className="pt-3 rich-text"
              dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}
            ></p>
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {playerData ? (
            <div>
              {/* 
                Protected Video Player:
                - All sharing options completely disabled
                - No YouTube branding or sharing buttons
                - Right-click and keyboard shortcuts disabled
                - Fullscreen and picture-in-picture disabled
                - Video URL is protected and cannot be shared
              */}
              <div className="w-full aspect-video video-protected" onContextMenu={(e) => e.preventDefault()}>
                <iframe
                  src={getProtectedYouTubeUrl(`https://www.youtube.com/watch?v=${playerData.videoId}`)}
                  className="w-full h-full"
                  allowFullScreen={false}
                  title="Course Preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                />
              </div>
            </div>
          ) : (
            <img src={courseData.courseThumbnail} alt="" />
          )}

          <div className="p-5">
            <div className="flex items-center gap-2">
              <img src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className="text-red-500">
                <span>5 days </span> left at this price!
              </p>
            </div>

            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                {currency}{' '}
                {calculateDiscountedPrice(courseData)}
              </p>
              <p className="md:text-lg text-gray-500 line-through">
                {currency}
                {courseData.coursePrice}
              </p>
              <p className="md:text-lg text-gray-500">
                {courseData.discountType === 'amount' 
                  ? `${currency}${courseData.discount} off` 
                  : `${courseData.discount}% off`}
              </p>
            </div>

            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{fixedRating}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>

              <div className="h-4 w-px bg-gray-500/40"></div>

              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lesson icon" />
                <p>{calculateNoOfLectures(courseData)}</p>
              </div>
            </div>

            {userData ? (
              <button
                onClick={enrolledCourse}
                className={`md:mt-6 mt-4 w-full py-3 rounded font-medium ${
                  isAlreadyEnrolled || userData.isAdmin
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white'
                }`}
                disabled={isAlreadyEnrolled || userData.isAdmin}
              >
                {userData.isAdmin
                  ? 'Admins cannot enroll'
                  : isAlreadyEnrolled
                  ? 'Already Enrolled'
                  : 'Enroll Now'}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/payment/${courseData._id}`)}
                className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium"
              >
                Login to Enroll
              </button>
            )}

            <div>
                             <p className="md:text-xl text-lg font-medium text-gray-800 mt-2">What's in the package?</p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Expert instructors and community support.</li>
                <li>Interactive assignments and quizzes.</li>
                <li>Certification upon completion.</li>
                <li>Access on mobile and desktop.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PackageDetails
