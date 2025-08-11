import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/users/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyEnrollments = () => {
  const {
    navigate,
    userData,
    backendUrl,
    getToken,
  } = useContext(AppContext);

  const [purchasedCourses, setPurchasedCourses] = useState([]);

  // Fetch purchased courses for the logged-in user
  const fetchUserPurchasedCourses = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/user/user-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (data.success) {
        const validCourses = (data.purchasedCourses || []).filter(course => course && course._id);
        setPurchasedCourses(validCourses);
      } else {
        toast.error(data.message || "Failed to fetch purchased courses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUserPurchasedCourses();
    }
  }, [userData]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <div className="flex-grow md:px-36 px-8 pt-10">
        <h1 className="text-2xl font-semibold">My Enrollments</h1>
        <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
          <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
            <tr>
              <th className="px-4 py-3 font-semibold truncate">Course</th>
              <th className="px-4 py-3 font-semibold truncate">Price</th>
              <th className="px-4 py-3 font-semibold truncate">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {purchasedCourses.map((course, index) => (
              <tr key={index} className="border-b border-gray-500/20">
                <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                  {course.courseThumbnail && (
                    <img
                      src={course.courseThumbnail}
                      alt=""
                      className="w-14 sm:w-24 md:w-28"
                    />
                  )}
                  <div className="flex1">
                    <p className="mb-1 max-sm:text-sm">{course.courseTitle || "Untitled Course"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 max-sm:hidden">
                  {course.coursePrice ? `Rs. ${course.coursePrice}` : "Free"}
                </td>
                <td className="px-4 py-3 max-sm:text-right">
                  <button
                    className="px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-xs text-white"
                    onClick={() => navigate('/course/' + course._id)}
                  >
                    View Course
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MyEnrollments;
