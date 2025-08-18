import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);


  const randomCourses = useMemo(() => {
    const shuffled = [...allCourses];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [allCourses]);

  return (
    <div className='w-full max-w-7xl mx-auto py-20 px-4'>
      <div className="text-center mb-16">
        <h2 className='text-4xl font-bold text-gray-800 mb-4'>Learn from the best</h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Discover high-quality learning packages designed to transform your skills and career
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
        {randomCourses.map((course, index) => (
          <CourseCard key={course._id || index} course={course} />
        ))}
      </div>

      <div className="text-center">
        <Link
          to={'/packages-list'}
          onClick={() => window.scrollTo(0, 0)}
          className='inline-block bg-gradient-to-r from-rose-500 to-pink-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-rose-600 hover:to-pink-700 transition-all duration-300 hover:shadow-xl transform hover:scale-105'
        >
          Show all packages
        </Link>
      </div>
    </div>
  );
};

export default CoursesSection;
