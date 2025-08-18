import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);

  const avgRating = 4.5; 
  const totalRatings = 120; 

  const calculateDiscountedPrice = (course) => {
    if (course.discountType === 'amount') {
      return Math.max(0, course.coursePrice - course.discount);
    } else {

      return course.coursePrice - (course.discount * course.coursePrice) / 100;
    }
  };

  return (
    <Link
      to={'/course/' + course._id}
      onClick={() => scrollTo(0, 0)}
      className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'
    >
      <img className='w-full h-48 object-cover' src={course.courseThumbnail} alt='' />
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold'>{course.courseTitle}</h3>

        <p className='text-gray-500'>
          {course.admin?.firstName} {course.admin?.lastName}
        </p>

        {/* Rating Section */}
        <div className='flex items-center space-x-2'>
          <p>{avgRating.toFixed(1)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={i < Math.floor(avgRating) ? assets.star : assets.star_blank}
                alt=''
                className='w-3.5 h-3.5'
              />
            ))}
          </div>
          <p className='text-gray-500'>{totalRatings}</p>
        </div>

        {/* Price Section */}
        <p className='text-base font-semibold text-gray-800'>
          {currency}
          {calculateDiscountedPrice(course)}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;
