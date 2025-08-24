import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import humanizeDuration from "humanize-duration";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;
  const navigate = useNavigate();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Get token from localStorage or sessionStorage
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Store token and user data after login
  const storeAuthData = (token, user) => {
    localStorage.setItem('token', token);
    setUserData(user);
    setIsEducator(user.isAdmin || false);
    setIsSubAdmin(user.isSubAdmin || user.role === 'subadmin' || false);
  };

  // Clear all authentication data
  const clearAuthData = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUserData(null);
    setIsEducator(false);
    setIsSubAdmin(false);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setPendingOrdersCount(0);
    setEnrolledCourses([]);
  };
  

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  // Fetch unread notification count
  const fetchUnreadNotificationCount = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.get(`${backendUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUnreadNotificationCount(data.count || 0);
      } else {
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      setUnreadNotificationCount(0);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.put(
        `${backendUrl}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.put(
        `${backendUrl}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = getToken();
      if (!token) return;

      const { data } = await axios.delete(
        `${backendUrl}/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Fetch pending orders count
  const fetchPendingOrdersCount = async () => {
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
  };

  // Fetch all courses
  const fetchAllCourses = async () => {
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
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = getToken();
      if (!token) return;

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
    }
  };


  // Fetch enrolled courses - only for admins
  const fetchUserEnrolledCourses = async () => {
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
  };

  // Load enrolled courses when userData changes and user is admin or sub-admin
  useEffect(() => {
    if (userData?.isAdmin || userData?.isSubAdmin || userData?.role === 'subadmin') {
      fetchUserEnrolledCourses();
    } else {
      setEnrolledCourses([]);
    }
  }, [userData]);

  // Refresh user data (useful after role changes)
  const refreshUserData = async () => {
    await fetchUserData();
  };

  // Function to calculate total time for a chapter
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration));
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to calculate total duration of a course
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) =>
      chapter.chapterContent.map((lecture) => (time += lecture.lectureDuration))
    );
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };

  // Function to count total lectures in a course
  const calculateNoOfLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach((chapter) => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length;
      }
    });
    return totalLectures;
  };

  // Initial load: fetch all courses
  useEffect(() => {
    fetchAllCourses();
  }, []);

  // Load user data on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchUserData();
    }
  }, []);

  // Load notifications when user data is available
  useEffect(() => {
    if (userData) {
      fetchNotifications();
      fetchUnreadNotificationCount();
      if (userData.isAdmin || userData.isSubAdmin || userData.role === 'subadmin') {
        fetchPendingOrdersCount();
      }
    }
  }, [userData]);

  // Set up polling for notifications every 30 seconds when user is logged in
  useEffect(() => {
    if (!userData) return;

    const interval = setInterval(() => {
      fetchUnreadNotificationCount();
      if (userData.isAdmin || userData.isSubAdmin || userData.role === 'subadmin') {
        fetchPendingOrdersCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userData]);

  // Set isEducator and isSubAdmin when userData changes
  useEffect(() => {
    if (userData) {
      setIsEducator(userData.isAdmin || false);
      setIsSubAdmin(userData.isSubAdmin || userData.role === 'subadmin' || false);
    }
  }, [userData]);

  const value = {
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
    notifications,
    unreadNotificationCount,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    pendingOrdersCount,
    fetchPendingOrdersCount,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
