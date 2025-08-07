import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const currency = import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);

    //  Get token from localStorage
    const getToken = () => {
        return localStorage.getItem("token");
    };

    //  Fetch all courses
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

    //  Fetch user data
    const fetchUserData = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const { data } = await axios.get(`${backendUrl}/api/user/getUserData`, {
                headers: { Authorization: `Bearer ${token}` },
            });

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

    //  Fetch enrolled courses
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

    //  Initial load
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
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
