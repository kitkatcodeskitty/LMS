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

    // Fetch all courses
    const fetchAllCourses = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/course/all');
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
            const { data } = await axios.get(`${backendUrl}/api/user/getUserData`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("user data", data);

            if (data.success) {
                setUserData(data.user);
                setIsEducator(data.user.isAdmin || false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Fetch enrolled courses
    const fetchUserEnrolledCourses = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const { data } = await axios.get(`${backendUrl}/api/user/purchased-courses`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse());
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Function to calculate total time for a chapter
    const calculateChapterTime = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration);
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to calculate total duration of a course
    const calculateCourseDuration = (course) => {
        let time = 0;
        course.courseContent.map((chapter) =>
            chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
        );
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // Function to count total lectures in a course
    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    // Initial load
    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        const token = getToken();
        if (token) {
            fetchUserData();
            fetchUserEnrolledCourses();
        }
    }, []);

    useEffect(() => {
        console.log("allCourses in context: ", allCourses);
    }, [allCourses]);

    const value = {
        currency,
        allCourses,
        navigate,
        isEducator,
        setIsEducator,
        enrolledCourses,
        fetchUserEnrolledCourses,
        backendUrl,
        userData,
        setUserData,
        getToken,
        fetchAllCourses,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
