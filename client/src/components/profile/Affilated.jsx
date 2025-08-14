import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ReferralCenter = ({ affiliateCode, affiliateLink, copyToClipboard }) => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseSpecificLink, setCourseSpecificLink] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const generateCourseLink = (courseId) => {
    if (!courseId || !affiliateCode) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/payment/${courseId}?ref=${affiliateCode}`;
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourse(courseId);
    const link = generateCourseLink(courseId);
    setCourseSpecificLink(link);
  };

  if (!affiliateCode) return null;

  return (
    <div className="space-y-6">
      {/* General Referral Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">General Referral Center</h3>
            <p className="text-gray-600 text-sm">Share your code and earn commissions</p>
          </div>
          <div className="text-3xl">🎯</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Code */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Your Referral Code
            </label>
            <div className="flex">
              <input
                type="text"
                value={affiliateCode}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 font-mono text-lg font-bold text-center min-w-0"
              />
              <button
                onClick={() => copyToClipboard(affiliateCode)}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-r-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Copy
              </button>
            </div>
          </div>

          {/* General Share Link */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              General Share Link
            </label>
            <div className="flex">
              <input
                type="text"
                value={affiliateLink}
                readOnly
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 text-sm min-w-0"
              />
              <button
                onClick={() => copyToClipboard(affiliateLink)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-r-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course-Specific Referral Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Course-Specific Referral Links</h3>
            <p className="text-gray-600 text-sm">Generate direct payment links for specific courses</p>
          </div>
          <div className="text-3xl">🎓</div>
        </div>

        <div className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Course
            </label>
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading courses...</span>
              </div>
            ) : (
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Choose a course to generate link...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.courseTitle} - ${course.coursePrice}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Generated Course Link */}
          {courseSpecificLink && (
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Course Payment Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={courseSpecificLink}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 text-sm min-w-0"
                />
                <button
                  onClick={() => copyToClipboard(courseSpecificLink)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-r-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Copy Link
                </button>
              </div>
              <p className="text-xs text-gray-500">
                This link takes users directly to the payment page for the selected course with your referral code applied.
              </p>
            </div>
          )}

          {/* Course Link Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">👤</div>
                <div>
                  <h4 className="font-semibold text-gray-900">For Non-Logged Users</h4>
                  <p className="text-sm text-gray-600">
                    Takes them to payment page with registration form included
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🔐</div>
                <div>
                  <h4 className="font-semibold text-gray-900">For Logged Users</h4>
                  <p className="text-sm text-gray-600">
                    Direct access to payment page with course pre-selected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Pro Tips for Maximum Earnings</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">•</span>
                <span>Use course-specific links when promoting individual courses for higher conversion rates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>General referral links work for any course purchase on the platform</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>Course-specific links streamline the purchase process and reduce friction</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Share links on social media, blogs, or directly with friends for best results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCenter;
