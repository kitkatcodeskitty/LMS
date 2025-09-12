import React, { useState } from 'react';
import { FaBookOpen, FaGraduationCap, FaPlay, FaClock, FaLock, FaUnlock } from 'react-icons/fa'; // Import icons

const Courses = ({ purchasedCourses, currency, navigate }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const handleLectureClick = (course, lecture) => {
    setSelectedCourse(course);
    setSelectedLecture(lecture);
    setShowVideoPlayer(true);
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedLecture(null);
    setSelectedCourse(null);
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>

      {purchasedCourses.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <div className="text-4xl mb-4 text-rose-500 flex justify-center">
            <FaGraduationCap />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Yet</h3>
          <p className="text-gray-600 mb-4">Start your learning journey today!</p>
          <button
            onClick={() => navigate('/packages-list')}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Browse Packages
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {purchasedCourses.map((course, courseIndex) => (
            <div key={courseIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Course Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                      {course.courseThumbnail ? (
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600">
                          <FaBookOpen className="text-white text-2xl" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{course.courseTitle || 'Untitled Course'}</h3>
                      <p className="text-sm text-gray-600">
                        Price: {course.coursePrice ? `${currency}${course.coursePrice}` : 'Free'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {course.courseContent?.reduce((total, chapter) => total + (chapter.chapterContent?.length || 0), 0) || 0} Lectures
                    </p>
                  </div>
                </div>
              </div>

              {/* Lectures Grid */}
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Course Lectures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.courseContent?.map((chapter, chapterIndex) => 
                    chapter.chapterContent?.map((lecture, lectureIndex) => (
                      <div 
                        key={`${chapterIndex}-${lectureIndex}`}
                        className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                        onClick={() => handleLectureClick(course, lecture)}
                      >
                        <div className="aspect-video bg-gray-200 relative">
                          {lecture.lectureThumbnail ? (
                            <img
                              src={lecture.lectureThumbnail}
                              alt={lecture.lectureTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                              <FaPlay className="text-white text-2xl" />
                            </div>
                          )}
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <FaPlay className="text-gray-800 text-lg ml-1" />
                            </div>
                          </div>

                          {/* Duration Badge */}
                          {lecture.lectureDuration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                              <FaClock className="w-3 h-3" />
                              <span>{formatDuration(lecture.lectureDuration)}</span>
                            </div>
                          )}

                          {/* Preview Badge */}
                          {lecture.isPreviewFree && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                              <FaUnlock className="w-3 h-3" />
                              <span>Free Preview</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3">
                          <h5 className="font-medium text-gray-900 text-sm mb-1 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {lecture.lectureTitle || 'Untitled Lecture'}
                          </h5>
                          <p className="text-xs text-gray-600">
                            Chapter {chapterIndex + 1} • Lecture {lectureIndex + 1}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {showVideoPlayer && selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedLecture.lectureTitle}
              </h3>
              <button
                onClick={closeVideoPlayer}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {selectedLecture.lectureUrl ? (
                  <iframe
                    src={selectedLecture.lectureUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedLecture.lectureTitle}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <FaPlay className="text-6xl mb-4 mx-auto opacity-50" />
                      <p className="text-lg">Video URL not available</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  {selectedLecture.lectureDuration && (
                    <div className="flex items-center space-x-1">
                      <FaClock className="w-4 h-4" />
                      <span>{formatDuration(selectedLecture.lectureDuration)}</span>
                    </div>
                  )}
                  {selectedLecture.isPreviewFree && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <FaUnlock className="w-4 h-4" />
                      <span>Free Preview</span>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-500">
                  From: {selectedCourse?.courseTitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;