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

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("token");
  };
  console.log("getToken", getToken());

  // Fetch all courses
  const fetchAllCourses = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/course/all");
      console.log("all course", data);
      if (data.success) {
        setAllCourses(data.courses);
      } else {
        toast.error(data.message);
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
      const { data } = await axios.get(`http://localhost:5000/api/user/getUserData`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("user data", data);

      setUserData(data);
      setIsEducator(data.isAdmin || false);
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to fetch user data");
    }
  };


  // Fetch enrolled courses - only for admins
const fetchUserEnrolledCourses = async () => {
  if (!userData?.isAdmin) {
    console.log("Not an admin — skipping enrolled courses fetch");
    return;
  }

  const token = getToken();
  if (!token) return;

  try {
    const { data } = await axios.get(`http://localhost:5000/api/admin/purchased-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("enrolled courses", data);

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
    console.log("User is an admin, fetching enrolled courses");
    fetchUserEnrolledCourses();
  } else {
    console.log("User is not an admin, clearing enrolled courses");
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


  useEffect(() => {
    if (userData?.isAdmin) {
        console.log("User is an admin, fetching enrolled courses");
      fetchUserEnrolledCourses();
    } else {
        console.log("User is not an admin, clearing enrolled courses");
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
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
