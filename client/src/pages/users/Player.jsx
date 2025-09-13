import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/users/Footer'
import Rating from '../../components/users/Rating'
import axios from 'axios'
import Loading from '../../components/users/Loading'
import { getProtectedYouTubeUrl, videoProtectionStyles } from '../../utils/videoProtection'

const Player = () => {
  const { enrolledCourses, calculateChapaterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [playerData, setPlayerData] = useState(null)
  const [progressArray, setProgressArray] = useState([null])
  const [initialRating, setInitialRating] = useState(0) 

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item)=>{
          if(item.userId === userData._id)
          setInitialRating(item.rating)
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  useEffect(() => {
    if(enrolledCourses.length > 0) {
      getCourseData();
    }
  }, [enrolledCourses])


  // Update course progress - TODO: This endpoint doesn't exist in backend
  const updateCourseProgress = async (courseId, lectureId) => {
    try {
      // const token = await getToken();
      // const {data} = await axios.post(`${backendUrl}/api/user/update-course-progress`, {courseId, lectureId}, { headers: { Authorization: `Bearer ${token}` } });

    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  };

  // Get course progress - TODO: This endpoint doesn't exist in backend
  const getCourseProgress = async (courseId) => {
    try {
      // const token = await getToken();
      // const {data} = await axios.post(`${backendUrl}/api/user/get-course-progress`, {courseId}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

    } catch (error) {
      console.error('Error getting course progress:', error);
    }
  };

  // Add rating - TODO: This endpoint doesn't exist in backend
  const addRating = async (courseId, rating) => {
    try {
      // const token = await getToken();
      // const {data} = await axios.post(`${backendUrl}/api/user/add-rating`, {courseId, rating}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

    } catch (error) {
      console.error('Error adding rating:', error);
    }
  };

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const {data} = await axios.post(`${backendUrl}/api/user/add-rating`, {courseId, rating}, {
        headers: { Authorization: `Bearer ${token}` } });

      if(data.success) {
        console.log(data.message);
        fetchUserEnrolledCourses();
      }else {
        console.error(data.message);
      }
    }catch (error) {
      console.error(error.message);
   
    }

    useEffect(()=>{
      getCourseData();
    },[])


  }
  return courseData ?  (
    <>
      <style>{videoProtectionStyles}</style>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left column */}
        <div className="text-grey-800">
          <h1 className="text-xl font-semibold">Course Structure</h1>

          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-grey-300 bg-white mb-2 rounded"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSections[index] ? 'rotate-180' : ''
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-medium md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} Lectures -{' '}
                      {calculateChapaterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openSections[index] ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <ul className="list-disc md:pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={
                              progressData && progressData.lectureCompleted.includes(lecture.lectureId)
                                ? assets.blue_tick_icon
                                : assets.play_icon
                            }
                            alt="play icon"
                            className="w-4 h-4 mt-1"
                          />

                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() =>
                                    setPlayerData({...lecture,chapter: index + 1,lecture : i+ 1})
                                  }
                                  className="text-blue-500 cursor-pointer"
                                >
                                  Watch
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ['h', 'm'] }
                                )}
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
            <div className='flex items-center gap-2 py-3 mt-10'>
              <h1 className='text-xl font-bold'>Rate this Course: </h1>
              <Rating initialRating={initialRating} onRate={handleRate} />

            </div>

          </div>




        {/* right column - Video Player */}
        <div className='md:mt-10' >
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
                  src={getProtectedYouTubeUrl(playerData.lectureUrl)}
                  className="w-full h-full"
                  allowFullScreen={false}
                  title={playerData.lectureTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                />
              </div>
              <div  className='flex justify-between items-center mt-1'>
              <p>
                {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
              </p>
              <button onClick={()=> updateCourseProgress(playerData.lectureId)} className='text-blue-600'>
                {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark complete'}
              </button>
            </div>
           </div>
          )
        :
        
        <img src={courseData ? courseData.courseThumbnail : ''} alt='' />
        }
          </div>
      </div>
      <Footer />
    </>
  ) : <Loading />; 
} 

export default Player