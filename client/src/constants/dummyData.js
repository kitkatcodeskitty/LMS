/**
 * Dummy data for development and testing
 * Separated from assets.js for better organization
 */

import { assets } from '../assets/assets';

export const dummyEducatorData = {
    "_id": "675ac1512100b91a6d9b8b24",
    "name": "GreatStack",
    "email": "user.greatstack@gmail.com",
    "imageUrl": "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yclFkaDBOMmFqWnBoTTRBOXZUanZxVlo0aXYifQ",
    "createdAt": "2024-12-12T10:56:17.930Z",
    "updatedAt": "2024-12-12T10:56:17.930Z",
    "__v": 0
};

export const dummyTestimonial = [
    {
        name: 'Rajesh Hamal',
        role: 'SWE 1 @ Amazon',
        image: assets.profile_img_1,
        rating: 5,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
    {
        name: 'Nikhil Upreti',
        role: 'SWE 2 @ Samsung',
        image: assets.profile_img_2,
        rating: 4,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
    {
        name: 'Biraj bhattara',
        role: 'SWE 2 @ Google',
        image: assets.profile_img_3,
        rating: 4.5,
        feedback: 'I\'ve been using Imagify for nearly two years, primarily for Instagram, and it has been incredibly user-friendly, making my work much easier.',
    },
];

export const dummyDashboardData = {
    "totalEarnings": 707.38,
    "enrolledStudentsData": [
        {
            "courseTitle": "Introduction to JavaScript",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Dilan",
                "imageUrl": "https://i.pinimg.com/736x/77/ae/72/77ae72a531da8a4e10897cbd446491bb.jpg"
            }
        },
        {
            "courseTitle": "Advanced Python Programming",
            "student": {
                "_id": "user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V",
                "name": "Great Stack",
                "imageUrl": "https://i.pinimg.com/736x/77/ae/72/77ae72a531da8a4e10897cbd446491bb.jpg"
            }
        }
    ],
    "totalCourses": 8
};

// Simplified dummy courses (removed massive data)
export const dummyCourses = [
    {
        "_id": "605c72efb3f1c2b1f8e4e1a1",
        "courseTitle": "Introduction to JavaScript",
        "courseDescription": "<h2>Learn the Basics of JavaScript</h2><p>JavaScript fundamentals course for beginners.</p>",
        "coursePrice": 49.99,
        "packageType": "premium",
        "isPublished": true,
        "discount": 20,
        "discountType": "percentage",
        "courseThumbnail": "https://img.youtube.com/vi/CBWnBi-awSA/maxresdefault.jpg"
    },
    {
        "_id": "675ac1512100b91a6d9b8b24",
        "courseTitle": "Advanced Python Programming",
        "courseDescription": "<h2>Deep Dive into Python Programming</h2><p>Advanced Python concepts and practices.</p>",
        "coursePrice": 79.99,
        "packageType": "elite",
        "isPublished": true,
        "discount": 15,
        "discountType": "percentage",
        "courseThumbnail": "https://img.youtube.com/vi/HdLIMoQkXFA/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a7",
        "courseTitle": "Web Development Bootcamp",
        "courseDescription": "<h2>Become a Full-Stack Web Developer</h2><p>Comprehensive web development course.</p>",
        "coursePrice": 99.99,
        "packageType": "supreme",
        "isPublished": true,
        "discount": 25,
        "discountType": "percentage",
        "courseThumbnail": "https://img.youtube.com/vi/lpx2zFkapIk/maxresdefault.jpg"
    }
];
