import { createContext, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY || 'Rs';
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Get token from localStorage or sessionStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }, []);

  // Store token and user data after login
  const storeAuthData = useCallback((token, user, rememberMe = true) => {
    if (rememberMe) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
    setUserData(user);
    setIsEducator(user.isAdmin || false);
    setIsSubAdmin(user.isSubAdmin || user.role === 'subadmin' || false);
  }, []);

  // Clear all authentication data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('navigated'); // Clear navigation status on logout
    setUserData(null);
    setIsEducator(false);
    setIsSubAdmin(false);
    setPendingOrdersCount(0);
    setEnrolledCourses([]);
    setIsAuthLoading(false);
  }, []);
  


  // Fetch pending orders count
  const fetchPendingOrdersCount = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setPendingOrdersCount(data.totalPending || 0);
      } else {
        setPendingOrdersCount(0);
      }
    } catch (error) {
      console.error('Error fetching pending orders count:', error);
      setPendingOrdersCount(0);
    }
  }, [backendUrl, getToken]);

  // Fetch all courses
  const fetchAllCourses = useCallback(async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/courses/all`);
      if (data.success) {
        setAllCourses(data.courses || []);
      } else {
        setAllCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setAllCourses([]);
    }
  }, [backendUrl]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      const { data } = await axios.get(`${backendUrl}/api/users/getUserData`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.user) {
        // Ensure all balance fields are properly formatted numbers
        const userData = {
          ...data.user,
          withdrawableBalance: Number(data.user.withdrawableBalance) || 0,
          totalWithdrawn: Number(data.user.totalWithdrawn) || 0,
          pendingWithdrawals: Number(data.user.pendingWithdrawals) || 0,
          affiliateEarnings: Number(data.user.affiliateEarnings) || 0,
          lifetimeEarnings: Number(data.user.lifetimeEarnings) || 0,
          dailyEarnings: Number(data.user.dailyEarnings) || 0,
          weeklyEarnings: Number(data.user.weeklyEarnings) || 0,
          monthlyEarnings: Number(data.user.monthlyEarnings) || 0,
          currentBalance: Number(data.user.currentBalance) || 0
        };
        
        setUserData(userData);
        setIsEducator(userData.isAdmin || false);
        setIsSubAdmin(userData.isSubAdmin || userData.role === 'subadmin' || false);
      } else {
        // Fallback for old response format (backward compatibility)
        const userData = {
          ...data,
          withdrawableBalance: Number(data.withdrawableBalance) || 0,
          totalWithdrawn: Number(data.totalWithdrawn) || 0,
          pendingWithdrawals: Number(data.pendingWithdrawals) || 0,
          affiliateEarnings: Number(data.affiliateEarnings) || 0,
          lifetimeEarnings: Number(data.lifetimeEarnings) || 0,
          dailyEarnings: Number(data.dailyEarnings) || 0,
          weeklyEarnings: Number(data.weeklyEarnings) || 0,
          monthlyEarnings: Number(data.monthlyEarnings) || 0,
          currentBalance: Number(data.currentBalance) || 0
        };
        
        setUserData(userData);
        setIsEducator(userData.isAdmin || false);
        setIsSubAdmin(userData.isSubAdmin || userData.role === 'subadmin' || false);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear invalid token
      clearAuthData();
    } finally {
      setIsAuthLoading(false);
    }
  }, [backendUrl, getToken, clearAuthData]);


  // Fetch enrolled courses - only for admins
  const fetchUserEnrolledCourses = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/admin/purchased-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setEnrolledCourses(Array.isArray(data.purchases) ? data.purchases.reverse() : []);
      } else {
        setEnrolledCourses([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setEnrolledCourses([]);
    }
  }, [backendUrl, getToken]);

  // Load enrolled courses when userData changes and user is admin or sub-admin
  useEffect(() => {
    if (userData?.isAdmin || userData?.isSubAdmin || userData?.role === 'subadmin') {
      fetchUserEnrolledCourses();
    } else {
      setEnrolledCourses([]);
    }
  }, [userData, fetchUserEnrolledCourses]);

  // Refresh user data (useful after role changes)
  const refreshUserData = useCallback(async () => {
    await fetchUserData();
  }, [fetchUserData]);

  // Function to calculate total time for a chapter
  const calculateChapterTime = useCallback((chapter) => {
    if (!chapter?.chapterContent) return '0h 0m';
    let time = 0;
    chapter.chapterContent.forEach((lecture) => {
      if (lecture.lectureDuration) {
        time += lecture.lectureDuration;
      }
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  }, []);

  // Function to calculate total duration of a course
  const calculateCourseDuration = useCallback((course) => {
    if (!course?.courseContent) return '0h 0m';
    let time = 0;
    course.courseContent.forEach((chapter) => {
      if (chapter.chapterContent) {
        chapter.chapterContent.forEach((lecture) => {
          if (lecture.lectureDuration) {
            time += lecture.lectureDuration;
          }
        });
      }
    });
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  }, []);

  // Function to count total lectures in a course
  const calculateNoOfLectures = useCallback((course) => {
    if (!course?.courseContent) return 0;
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  }, []);

  // Initial load: fetch all courses
  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  // Load user data on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserData();
    } else {
      setIsAuthLoading(false);
    }
  }, [getToken, fetchUserData]);

  // Load data when user data is available
  useEffect(() => {
    if (userData) {
      if (userData.isAdmin || userData.isSubAdmin || userData.role === 'subadmin') {
        fetchPendingOrdersCount();
      }
    }
  }, [userData, fetchPendingOrdersCount]);

  // Set up polling for data every 30 seconds when user is logged in
  useEffect(() => {
    if (!userData) return;

    const interval = setInterval(() => {
      if (userData.isAdmin || userData.isSubAdmin || userData.role === 'subadmin') {
        fetchPendingOrdersCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userData, fetchPendingOrdersCount]);

  // Set isEducator and isSubAdmin when userData changes
  useEffect(() => {
    if (userData) {
      setIsEducator(userData.isAdmin || false);
      setIsSubAdmin(userData.isSubAdmin || userData.role === 'subadmin' || false);
    }
  }, [userData]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currency,
    allCourses,
    navigate,
    isEducator,
    setIsEducator,
    isSubAdmin,
    setIsSubAdmin,
    enrolledCourses,
    fetchUserEnrolledCourses,
    fetchUserData,
    refreshUserData,
    storeAuthData,
    backendUrl,
    userData,
    setUserData,
    getToken,
    clearAuthData,
    fetchAllCourses,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    pendingOrdersCount,
    fetchPendingOrdersCount,
    isAuthLoading,
  }), [
    currency,
    allCourses,
    navigate,
    isEducator,
    isSubAdmin,
    enrolledCourses,
    fetchUserEnrolledCourses,
    fetchUserData,
    refreshUserData,
    storeAuthData,
    backendUrl,
    userData,
    getToken,
    clearAuthData,
    fetchAllCourses,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    pendingOrdersCount,
    fetchPendingOrdersCount,
    isAuthLoading,
  ]);

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
