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
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };
  

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Fetch unread notification count
  const fetchUnreadNotificationCount = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setUnreadNotificationCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/notifications/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        const deletedNotif = notifications.find(n => n._id === notificationId);
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadNotificationCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  // Fetch pending orders count
  const fetchPendingOrdersCount = async () => {
    const token = getToken();
    if (!token || !userData?.isAdmin) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setPendingOrdersCount(data.totalPending || 0);
      }
    } catch (error) {
      console.error("Failed to fetch pending orders count:", error);
    }
  };

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/all`);
      
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        console.error("Failed to fetch courses:", data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/getUserData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      setUserData(data);
      setIsEducator(data.isAdmin || false);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to fetch user data");
    }
  };


  // Fetch enrolled courses - only for admins
const fetchUserEnrolledCourses = async () => {
  if (!userData?.isAdmin) {
    
    return;
  }

  const token = getToken();
  if (!token) return;

  try {
    const { data } = await axios.get(`${backendUrl}/api/admin/purchased-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    

    if (data.success) {
      setEnrolledCourses(Array.isArray(data.purchases) ? data.purchases.reverse() : []);
    } else {
      console.error("Failed to fetch enrolled courses:", data.message);
    }
  } catch (error) {
    console.error(
      "Error fetching enrolled courses:",
      error.response?.data?.message || error.message
    );
  }
};

// Load enrolled courses when userData changes and user is admin
useEffect(() => {
  if (userData?.isAdmin) {
    
    fetchUserEnrolledCourses();
  } else {
    
    setEnrolledCourses([]);
  }
}, [userData]);


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
      if (userData.isAdmin) {
        fetchPendingOrdersCount();
      }
    }
  }, [userData]);

  // Set up polling for notifications every 30 seconds when user is logged in
  useEffect(() => {
    if (!userData) return;

    const interval = setInterval(() => {
      fetchUnreadNotificationCount();
      if (userData.isAdmin) {
        fetchPendingOrdersCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [userData]);


  useEffect(() => {
    if (userData?.isAdmin) {
        
      fetchUserEnrolledCourses();
    } else {
        
      setEnrolledCourses([]); 
    }
  }, [userData]);

  const value = {
    currency,
    allCourses,
    navigate,
    isEducator,
    setIsEducator,
    enrolledCourses,
    fetchUserEnrolledCourses,
    fetchUserData,
    backendUrl,
    userData,
    setUserData,
    getToken,
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
