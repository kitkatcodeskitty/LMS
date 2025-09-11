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
        name: 'Sita Thapa',
        role: 'Software Engineer @ Tech Nepal',
        image: 'https://images.unsplash.com/photo-1693234923854-f770fa33e587?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5,
        feedback: 'GrowthNepal has completely transformed my career! The Elite package gave me the skills I needed to land my dream job at Tech Nepal. The content is practical and the support is amazing.',
    },
    {
        name: 'Ram Gurung',
        role: 'Full Stack Developer @ Himalayan Tech',
        image: 'https://images.unsplash.com/photo-1619349457739-032073840c73?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5,
        feedback: 'As a developer from Pokhara, I never thought I could compete globally. GrowthNepal\'s Creator package changed everything. Now I\'m working with international clients!',
    },
    {
        name: 'Anita Shrestha',
        role: 'Data Analyst @ Nepal Bank',
        image: 'https://images.unsplash.com/photo-1660644802556-c66cbe6d447e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        rating: 5,
        feedback: 'The Prime package helped me transition from traditional banking to modern data analytics. The instructors are world-class and the community support is incredible. Highly recommended!',
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
        "packageType": "elite",
        "courseLimit": 1,
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
        "packageType": "creator",
        "courseLimit": 3,
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
        "packageType": "prime",
        "courseLimit": 4,
        "isPublished": true,
        "discount": 25,
        "discountType": "percentage",
        "courseThumbnail": "https://img.youtube.com/vi/lpx2zFkapIk/maxresdefault.jpg"
    },
    {
        "_id": "605c72efb3f1c2b1f8e4e1a8",
        "courseTitle": "Master Data Science",
        "courseDescription": "<h2>Complete Data Science Mastery</h2><p>Comprehensive data science and machine learning course.</p>",
        "coursePrice": 149.99,
        "packageType": "master",
        "courseLimit": 6,
        "isPublished": true,
        "discount": 30,
        "discountType": "percentage",
        "courseThumbnail": "https://img.youtube.com/vi/ua-CiDNNj30/maxresdefault.jpg"
    }
];
