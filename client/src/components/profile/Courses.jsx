import React from 'react';
import { FaBookOpen, FaGraduationCap } from 'react-icons/fa'; // Import icons

const Courses = ({ purchasedCourses, currency, navigate }) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-200 relative">
                {course.courseThumbnail ? (
                  <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-500 to-pink-600">
                    <span className="text-white text-4xl">
                      <FaBookOpen />
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{course.courseTitle || 'Untitled Course'}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Price: {course.coursePrice ? `${currency}${course.coursePrice}` : 'Free'}
                </p>
                <button
                  onClick={() => navigate(`/package/${course._id}`)}
                  className="w-full bg-rose-500 text-white py-2 rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;