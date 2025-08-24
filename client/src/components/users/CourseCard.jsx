import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import { calculateDiscountedPrice } from '../../utils/priceUtils';
import { getCourseCardStyling } from '../../constants/packages';
import AnimatedNumber from '../common/AnimatedNumber';
import {
  FaCrown,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);

  const packageStyle = getCourseCardStyling(course.packageType);

  // Get package description based on package type
  const getPackageDescription = (packageType) => {
    switch (packageType) {
      case 'elite':
        return 'Perfect for beginners. Access to 1 premium course with lifetime access and certificate.';
      case 'creator':
        return 'Ideal for intermediate learners. Access to 3 premium courses with priority support.';
      case 'prime':
        return 'Great for serious learners. Access to 4 premium courses with exclusive content.';
      case 'master':
        return 'Ultimate learning experience. Access to 6 premium courses with personal mentorship.';
      default:
        return 'Premium learning package with comprehensive content and support.';
    }
  };

  return (
    <div className="relative bg-white overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 w-full max-w-sm mx-auto">
      {/* Package Badge */}
      <div className={`absolute top-4 right-4 ${packageStyle.badgeBg} ${packageStyle.badgeText} px-3 py-2 rounded-xl text-xs font-bold z-10 shadow-lg backdrop-blur-sm flex items-center space-x-1`}>
        {course.packageType === 'master' && <FaCrown className="w-3 h-3" />}
        <span>{packageStyle.badgeLabel}</span>
      </div>
      
      {/* Premium Glow Effect */}
      {course.packageType === 'master' && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-400/5 to-red-400/10 pointer-events-none rounded-2xl"></div>
      )}
      
      {/* Image Container */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden p-4">
        {course.courseThumbnail ? (
          <img 
            className='w-full h-full object-contain transition-transform duration-500 group-hover:scale-105' 
            src={course.courseThumbnail} 
            alt={course.courseTitle} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl">
            <div className="text-5xl text-rose-400">📚</div>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content Section */}
      <div className='p-6 text-left'>
        {/* Title */}
        <h3 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-rose-600 transition-colors duration-300'>
          {course.courseTitle}
        </h3>

        {/* Description */}
        <p className='text-sm text-gray-600 mb-6 leading-relaxed line-clamp-4'>
          {getPackageDescription(course.packageType)}
        </p>

        {/* Price Section */}
        <div className='mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200'>
          <div className="flex items-center justify-between">
            <div>
              <div className='text-3xl font-bold text-gray-900 flex items-center'>
                <AnimatedNumber 
                  value={calculateDiscountedPrice(course)} 
                  currency={currency}
                  duration={1500}
                  delay={200}
                />
              </div>
              <p className='text-xs text-gray-500 flex items-center mt-1'>
                <FaCheckCircle className="w-3 h-3 text-green-500 mr-1" />
                One-time payment
              </p>
            </div>
            
            {/* Package Type Indicator */}
            <div className={`px-4 py-2 rounded-xl ${packageStyle.badgeBg} ${packageStyle.badgeText} font-semibold text-sm shadow-sm`}>
              {course.packageType?.charAt(0).toUpperCase() + course.packageType?.slice(1)}
            </div>
          </div>
        </div>

        {/* Buy Now Button */}
        <Link
          to={'/package/' + course._id}
          onClick={() => window.scrollTo(0, 0)}
          className={`w-full flex items-center justify-center space-x-2 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
            course.packageType === 'master'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
              : course.packageType === 'prime'
              ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              : course.packageType === 'creator'
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <span>{course.packageType === 'master' ? 'Get Premium Access' : 'Buy Now'}</span>
          <FaArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
      
      {/* Premium Shine Effect for Master Package */}
      {course.packageType === 'master' && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-75"></div>
      )}
    </div>
  );
};

export default CourseCard;
