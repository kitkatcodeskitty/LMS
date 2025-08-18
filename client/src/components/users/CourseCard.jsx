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

  // Get package styling based on package type
  const getPackageStyling = () => {
    switch (course.packageType) {
      case 'supreme':
        return {
          borderColor: 'border-blue-500',
          badgeBg: 'bg-gradient-to-r from-blue-600 to-blue-700',
          badgeText: 'text-white',
          badgeLabel: 'SUPREME',
          cardShadow: 'hover:shadow-blue-500/25',
          specialEffect: 'relative overflow-hidden'
        };
      case 'elite':
        return {
          borderColor: 'border-purple-500',
          badgeBg: 'bg-gradient-to-r from-purple-600 to-purple-700',
          badgeText: 'text-white',
          badgeLabel: 'ELITE',
          cardShadow: 'hover:shadow-purple-500/25',
          specialEffect: ''
        };
      case 'premium':
      default:
        return {
          borderColor: 'border-gray-500/30',
          badgeBg: 'bg-gradient-to-r from-rose-500 to-pink-600',
          badgeText: 'text-white',
          badgeLabel: 'PREMIUM',
          cardShadow: 'hover:shadow-lg',
          specialEffect: ''
        };
    }
  };

  const packageStyle = getPackageStyling();

  return (
    <Link
      to={'/package/' + course._id}
      onClick={() => window.scrollTo(0, 0)}
      className={`border ${packageStyle.borderColor} pb-6 overflow-hidden rounded-lg hover:scale-105 transition-all duration-300 transform ${packageStyle.cardShadow} ${packageStyle.specialEffect}`}
    >
      {/* Package Badge */}
      <div className={`absolute top-3 right-3 ${packageStyle.badgeBg} ${packageStyle.badgeText} px-3 py-1 rounded-full text-xs font-bold z-10`}>
        {packageStyle.badgeLabel}
      </div>
      
      {/* Special effect for Supreme package */}
      {course.packageType === 'supreme' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-400/10 pointer-events-none"></div>
      )}
      
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
