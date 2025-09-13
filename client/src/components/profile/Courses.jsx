import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FaBookOpen, FaGraduationCap, FaPlay, FaClock, FaLock, FaUnlock, FaArrowLeft, FaList, FaChevronRight } from 'react-icons/fa';
import { getProtectedYouTubeUrl, videoProtectionStyles, initializeVideoProtection, monitorVideoContainers } from '../../utils/videoProtection';

const Courses = ({ purchasedCourses, currency, navigate }) => {
  // View states: 'packages', 'chapters', 'lectures'
  const [currentView, setCurrentView] = useState('packages');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showInPlaceVideo, setShowInPlaceVideo] = useState(false);
  const [activeVideoChapter, setActiveVideoChapter] = useState(null);
  const [activeVideoLecture, setActiveVideoLecture] = useState(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  // Initialize video protection
  useEffect(() => {
    initializeVideoProtection();
    const observer = monitorVideoContainers();
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handlePackageClick = useCallback((course) => {
    setSelectedCourse(course);
    setCurrentView('chapters');
  }, []);

  const handleChapterClick = useCallback((chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('lectures');
  }, []);

  const handleLectureClick = useCallback((lecture) => {
    setSelectedLecture(lecture);
    setShowVideoPlayer(true);
  }, []);

  const handleInPlaceLectureClick = useCallback((lecture, chapterIndex) => {
    setSelectedLecture(lecture);
    setActiveVideoLecture(lecture);
    setActiveVideoChapter(chapterIndex);
    setShowInPlaceVideo(true);
  }, []);

  const closeVideoPlayer = useCallback(() => {
    setShowVideoPlayer(false);
    setSelectedLecture(null);
  }, []);

  const closeInPlaceVideo = useCallback(() => {
    setShowInPlaceVideo(false);
    setSelectedLecture(null);
    setActiveVideoLecture(null);
    setActiveVideoChapter(null);
  }, []);

  const goBackToPackages = useCallback(() => {
    setCurrentView('packages');
    setSelectedCourse(null);
    setSelectedChapter(null);
    setSelectedLecture(null);
    setShowInPlaceVideo(false);
    setActiveVideoLecture(null);
    setActiveVideoChapter(null);
    setSelectedChapterIndex(0);
  }, []);

  const goBackToChapters = useCallback(() => {
    setCurrentView('chapters');
    setSelectedChapter(null);
    setSelectedLecture(null);
    setShowInPlaceVideo(false);
    setActiveVideoLecture(null);
    setActiveVideoChapter(null);
    setSelectedChapterIndex(0);
  }, []);

  const handleChapterSelect = useCallback((chapterIndex) => {
    setSelectedChapterIndex(chapterIndex);
    setShowInPlaceVideo(false);
    setActiveVideoLecture(null);
    setActiveVideoChapter(null);
  }, []);

  const formatDuration = useCallback((minutes) => {
    if (!minutes) return '0:00';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}:00`;
  }, []);

  // Memoize expensive calculations
  const courseStats = useMemo(() => {
    return purchasedCourses.map(course => ({
      ...course,
      totalLectures: course.courseContent?.reduce((total, chapter) => 
        total + (chapter.chapterContent?.length || 0), 0) || 0
    }));
  }, [purchasedCourses]);

  // Render Packages View
  const renderPackagesView = useCallback(() => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>

      {courseStats.length === 0 ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courseStats.map((course, courseIndex) => (
            <div 
              key={course._id || courseIndex} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handlePackageClick(course)}
            >
              {/* Package Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                {course.courseThumbnail ? (
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600">
                    <FaBookOpen className="text-white text-4xl" />
                  </div>
                )}
                
                {/* Overlay with arrow */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300">
                    <FaChevronRight className="text-gray-800 text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </div>

              {/* Package Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.courseTitle || 'Untitled Course'}
                </h3>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span className="font-medium">
                    {course.coursePrice ? `${currency}${course.coursePrice}` : 'Free'}
                  </span>
                  <span>
                    {course.totalLectures} Lectures
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ), [courseStats, currency, navigate, handlePackageClick]);

  // Render Chapters View
  const renderChaptersView = useCallback(() => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={goBackToPackages}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Packages</span>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedCourse?.courseTitle}</h2>
          {selectedCourse?.courseContent && selectedCourse.courseContent[selectedChapterIndex] && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedCourse.courseContent[selectedChapterIndex].chapterTitle || `Chapter ${selectedChapterIndex + 1}`}
            </p>
          )}
        </div>
      </div>

      {/* Chapter Selector */}
      {selectedCourse?.courseContent && selectedCourse.courseContent.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Chapter</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedCourse.courseContent.map((chapter, chapterIndex) => (
              <button
                key={chapter._id || chapterIndex}
                onClick={() => handleChapterSelect(chapterIndex)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  selectedChapterIndex === chapterIndex
                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {chapter.chapterTitle || `Chapter ${chapterIndex + 1}`}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {chapter.chapterContent?.length || 0} Lectures
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <FaChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Chapter Content */}
      {selectedCourse?.courseContent && selectedCourse.courseContent[selectedChapterIndex] && (
        <div className="space-y-6">
          {(() => {
            const chapter = selectedCourse.courseContent[selectedChapterIndex];
            const chapterIndex = selectedChapterIndex;
            return (
          <div key={chapter._id || chapterIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Chapter Banner */}
            <div className="aspect-video bg-gray-200 relative">
              {showInPlaceVideo && activeVideoChapter === chapterIndex && activeVideoLecture ? (
                // In-place Video Player
                <div className="w-full h-full bg-black relative select-none video-protected" onContextMenu={(e) => e.preventDefault()}>
                  <div className="absolute top-4 left-4 z-10">
                    <button
                      onClick={closeInPlaceVideo}
                      className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                    >
                      <FaArrowLeft className="w-4 h-4" />
                      <span>Back to Banner</span>
                    </button>
                  </div>
                  
                  {activeVideoLecture.lectureUrl ? (
                    <iframe
                      src={getProtectedYouTubeUrl(activeVideoLecture.lectureUrl)}
                      className="w-full h-full"
                      allowFullScreen={false}
                      title={activeVideoLecture.lectureTitle}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
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
              ) : (
                // Chapter Banner
                <>
                  {chapter.chapterBanner ? (
                    <img
                      src={chapter.chapterBanner}
                      alt={chapter.chapterTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      <FaBookOpen className="text-white text-4xl" />
                    </div>
                  )}
                </>
              )}
            </div>
            
            {/* Chapter Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {chapter.chapterTitle || `Chapter ${chapterIndex + 1}`}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{chapter.chapterContent?.length || 0} Lectures</span>
                <span>Chapter {chapterIndex + 1}</span>
              </div>

              {/* Lectures List */}
              {chapter.chapterContent && chapter.chapterContent.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                    <FaList className="w-4 h-4 mr-2" />
                    Lectures
                  </h4>
                  <div className="space-y-2">
                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                      <div 
                        key={lecture._id || lectureIndex}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          activeVideoLecture && activeVideoLecture === lecture && activeVideoChapter === chapterIndex
                            ? 'bg-blue-50 border-blue-200 shadow-sm' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                        }`}
                        onClick={() => handleInPlaceLectureClick(lecture, chapterIndex)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <FaPlay className="text-white text-xs" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 text-sm">
                              {lecture.lectureTitle || `Lecture ${lectureIndex + 1}`}
                            </h5>
                            <div className="flex items-center space-x-3 text-xs text-gray-600">
                              {lecture.lectureDuration && (
                                <div className="flex items-center space-x-1">
                                  <FaClock className="w-3 h-3" />
                                  <span>{formatDuration(lecture.lectureDuration)}</span>
                                </div>
                              )}
                              {lecture.isPreviewFree && (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <FaUnlock className="w-3 h-3" />
                                  <span>Free Preview</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <FaChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
            );
          })()}
        </div>
      )}
    </div>
  ), [selectedCourse, showInPlaceVideo, selectedLecture, goBackToPackages, closeInPlaceVideo, handleInPlaceLectureClick, formatDuration, selectedChapterIndex, handleChapterSelect, activeVideoChapter, activeVideoLecture]);

  // Render Lectures View
  const renderLecturesView = useCallback(() => (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={goBackToChapters}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Chapters</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{selectedChapter?.chapterTitle}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedChapter?.chapterContent?.map((lecture, lectureIndex) => (
          <div 
            key={lecture._id || lectureIndex}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => handleLectureClick(lecture)}
          >
            <div className="aspect-video bg-gray-200 relative">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600">
                <FaPlay className="text-white text-2xl" />
              </div>
              
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
              <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                {lecture.lectureTitle || 'Untitled Lecture'}
              </h5>
              <p className="text-xs text-gray-600">
                Lecture {lectureIndex + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [selectedChapter, goBackToChapters, handleLectureClick, formatDuration]);

  // Memoize the video player modal
  const videoPlayerModal = useMemo(() => {
    if (!showVideoPlayer || !selectedLecture) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedLecture.lectureTitle}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedCourse?.courseTitle} • {selectedChapter?.chapterTitle}
              </p>
            </div>
            <button
              onClick={closeVideoPlayer}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden select-none video-protected" onContextMenu={(e) => e.preventDefault()}>
              {selectedLecture.lectureUrl ? (
                <iframe
                  src={getProtectedYouTubeUrl(selectedLecture.lectureUrl)}
                  className="w-full h-full"
                  allowFullScreen={false}
                  title={selectedLecture.lectureTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
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
                Lecture from {selectedChapter?.chapterTitle}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [showVideoPlayer, selectedLecture, selectedCourse, selectedChapter, closeVideoPlayer, formatDuration]);

  return (
    <>
      <style>{videoProtectionStyles}</style>
      <div className="space-y-6">
        {currentView === 'packages' && renderPackagesView()}
        {currentView === 'chapters' && renderChaptersView()}
        {currentView === 'lectures' && renderLecturesView()}
        {videoPlayerModal}
      </div>
    </>
  );
};

export default React.memo(Courses);