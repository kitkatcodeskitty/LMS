import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
const ReferralCenter = ({ affiliateCode, affiliateLink }) => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseSpecificLink, setCourseSpecificLink] = useState('');
  const [hasPurchases, setHasPurchases] = useState(false);
  const [checkingPurchases, setCheckingPurchases] = useState(true);
  const [copiedText, setCopiedText] = useState('');

  // Copy to clipboard function
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000); // Reset after 2 seconds
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    }
  };

  useEffect(() => {
    fetchCourses();
    checkUserPurchases();
  }, []);

  const checkUserPurchases = async () => {
    try {
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/users/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success && data.purchasedCourses && data.purchasedCourses.length > 0) {
        setHasPurchases(true);
      }
    } catch (error) {
      console.error('Error checking user purchases:', error);
    } finally {
      setCheckingPurchases(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/all`);
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

  // Show loading state while checking purchases
  if (checkingPurchases) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading referral center...</span>
      </div>
    );
  }

  // Show message if user hasn't purchased any courses
  if (!hasPurchases) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center border border-blue-200 animate-fade-in-up">
        <div className="text-6xl mb-4 animate-bounce">🎓</div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4 animate-fade-in-up animation-delay-200">Unlock Your Referral Center</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto animate-fade-in-up animation-delay-300">
          Purchase your first package to unlock the referral system and start earning commissions by sharing packages with others!
        </p>
        <div className="bg-white rounded-xl p-4 border border-blue-200 mb-6 animate-fade-in-up animation-delay-400">
          <h4 className="font-semibold text-gray-900 mb-2">🎯 What you'll get:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Your unique referral code</li>
            <li>• 50% commission on every referral</li>
            <li>• Package-specific referral links</li>
            <li>• Real-time earnings tracking</li>
          </ul>
        </div>
        <button
                       onClick={() => window.location.href = '/packages-list'}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg transform animate-fade-in-up animation-delay-500"
        >
                      Browse Packages
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Referral Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
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
                onClick={() => copyToClipboard(affiliateCode, 'Referral Code')}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-r-xl hover:from-rose-600 hover:to-pink-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg transform"
              >
                {copiedText === 'Referral Code' ? 'Copied!' : 'Copy'}
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
                onClick={() => copyToClipboard(affiliateLink, 'General Share Link')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-r-xl hover:from-blue-600 hover:to-cyan-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg transform"
              >
                {copiedText === 'General Share Link' ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Course-Specific Referral Section */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up animation-delay-200">
        <div className="flex items-center justify-between mb-6">
          <div>
                    <h3 className="text-xl font-bold text-gray-900">Package-Specific Referral Links</h3>
        <p className="text-gray-600 text-sm">Generate direct payment links for specific packages</p>
          </div>
          <div className="text-3xl">🎓</div>
        </div>

        <div className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Select Package
            </label>
            {loadingCourses ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600">Loading packages...</span>
              </div>
            ) : (
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseSelect(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="">Choose a package to generate link...</option>
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
                Package Payment Link
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={courseSpecificLink}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 text-sm min-w-0"
                />
                <button
                  onClick={() => copyToClipboard(courseSpecificLink, 'Package Payment Link')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-r-xl hover:from-purple-600 hover:to-indigo-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg transform"
                >
                  {copiedText === 'Package Payment Link' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                This link takes users directly to the payment page for the selected package with your referral code applied.
              </p>
            </div>
          )}

          {/* Course Link Benefits */}

        </div>
      </div>

      {/* Pro Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 animate-fade-in-up animation-delay-400">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Pro Tips for Maximum Earnings</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-green-500 font-bold">•</span>
                <span>Use package-specific links when promoting individual packages for higher conversion rates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>General referral links work for any package purchase on the platform</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-purple-500 font-bold">•</span>
                <span>Package-specific links streamline the purchase process and reduce friction</span>
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
