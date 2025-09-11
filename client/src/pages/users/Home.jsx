import React, { useContext, useMemo, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Hero from '../../components/users/Hero'
import TestimonialsSection from '../../components/users/TestimonialsSection'
import CallToAction from '../../components/users/CallToAction'
import Footer from '../../components/users/Footer'
import Popup from '../../components/common/Popup'
import SEOHead from '../../components/common/SEOHead'
import axios from 'axios'
import { 
  getPackageStyling, 
  getPackageBadge, 
  getPackageBadgeColor, 
  getPackageTitle, 
  getPackageCourseCount, 
  getPackageFeatures, 
  getPackageEarningRange 
} from '../../constants/packages'

// Custom CSS for floating animations
const floatingStyles = `
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    25% { transform: translateY(-20px) translateX(10px); }
    50% { transform: translateY(-10px) translateX(-15px); }
    75% { transform: translateY(-15px) translateX(5px); }
  }
  
  @keyframes float-slower {
    0%, 100% { transform: translateY(0px) translateX(0px); }
    33% { transform: translateY(-15px) translateX(-10px); }
    66% { transform: translateY(-25px) translateX(15px); }
  }
  
  .animate-float-slow {
    animation: float-slow 8s ease-in-out infinite;
  }
  
  .animate-float-slower {
    animation: float-slower 12s ease-in-out infinite;
  }
`;

const Home = () => {
  const { allCourses, currency, backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [popup, setPopup] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  const randomCourses = useMemo(() => {
    const shuffled = [...allCourses];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[i], shuffled[j]];
    }
    // Filter out Elite package (lowest price) and only show 3 packages
    return shuffled
      .filter(course => course.packageType !== 'elite')
      .slice(0, 3);
  }, [allCourses]);

  const sortedPackages = useMemo(() => {
    // Sort courses to ensure Master is in the middle (position 2)
    const sorted = [...randomCourses].sort((a, b) => {
      // Define order: Creator (1st), Master (2nd - middle), Prime (3rd)
      const getOrder = (packageType) => {
        switch (packageType) {
          case 'creator': return 1;
          case 'master': return 2; // Master in the middle
          case 'prime': return 3;
          default: return 4;
        }
      };
      
      return getOrder(a.packageType) - getOrder(b.packageType);
    });
    return sorted;
  }, [randomCourses]);

  // Fetch active popup on component mount - for everyone (logged in or not)
  useEffect(() => {
    const fetchActivePopup = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/popups/active`);
        
        if (response.data.success && response.data.popup) {
          setPopup(response.data.popup);
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Error fetching popup:', error);
      }
    };

    // Fetch popup immediately when component mounts
    fetchActivePopup();
    
    // Also fetch popup when page becomes visible (for page reloads)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchActivePopup();
      }
    };
    
    // Listen for page visibility changes (optional, for better UX)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [backendUrl]);

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  return (
    <div className='relative flex flex-col items-center text-center overflow-hidden'>
      {/* SEO Head Component */}
      <SEOHead 
        title="Growth Nepal - Online Learning Platform | Professional Development Courses | Web Development Training"
        description="Master in-demand skills with Growth Nepal - the premier online learning platform. Expert-led courses in web development, data science, digital marketing, programming & more. Start your tech career today!"
        keywords="online learning platform, professional development courses, web development training, data science courses, digital marketing courses, programming bootcamp, online education Nepal, tech education Nepal, programming courses Nepal, digital skills training, career advancement, tech courses, coding bootcamp, software development, full stack development, frontend development, backend development, python programming, javascript courses, react training, node.js courses, database management, cloud computing, cybersecurity training, UI/UX design, mobile app development, growthnepal, growthnepal.com"
        url="https://growthnepal.com"
        image="https://growthnepal.com/og-image.jpg"
        type="website"
      />
      
      {/* Inject custom CSS for floating animations */}
      <style>{floatingStyles}</style>
      
      {/* Popup Component */}
      {showPopup && popup && (
        <Popup popup={popup} onClose={handlePopupClose} />
      )}
      

      
      {/* Beautiful Background Ellipses with Blur Effects - Covering Whole Home Page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Large Rose/Pink Ellipse - Top Right */}
        <div className="absolute -top-60 -right-60 w-[500px] h-[500px] bg-gradient-to-br from-rose-200 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-slow"></div>
        
        {/* Large Blue/Indigo Ellipse - Bottom Left */}
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-slower"></div>
        
        {/* Medium Purple/Pink Ellipse - Center Left */}
        <div className="absolute top-1/3 -left-40 w-[300px] h-[300px] bg-gradient-to-br from-purple-200 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
        
        {/* Small Yellow/Orange Ellipse - Top Center */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-[200px] h-[200px] bg-gradient-to-br from-yellow-200 to-orange-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-float-slower"></div>
        
        {/* Medium Green/Teal Ellipse - Bottom Right */}
        <div className="absolute bottom-40 right-20 w-[350px] h-[350px] bg-gradient-to-br from-green-100 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float-slow"></div>
        
        {/* Additional Small Ellipses for More Visual Interest */}
        <div className="absolute top-1/4 right-1/4 w-[150px] h-[150px] bg-gradient-to-br from-indigo-200 to-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-float-slow"></div>
        
        <div className="absolute bottom-1/4 left-1/3 w-[120px] h-[120px] bg-gradient-to-br from-pink-200 to-rose-300 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-float-slower"></div>
        
        {/* Blue Ellipses for More Variety */}
        
        <div className="absolute bottom-1/3 right-1/4 w-[140px] h-[140px] bg-gradient-to-br from-sky-200 to-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float-slower"></div>
        
      </div>

        <Hero />
      
      {/* Featured Learning Packages Section */}
      <div className="w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-24 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-rose-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-500 rounded-full filter blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-full border border-rose-500/30 mb-6">
              <span className="text-rose-400 font-semibold text-sm uppercase tracking-wider">Learning Packages</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Choose Your 
              <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent"> Perfect </span>
              Package
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Unlock your potential with our expertly crafted learning experiences designed to transform your career and boost your earning potential
            </p>
          </div>
          
          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sortedPackages.map((course, index) => {
              const isMaster = course.packageType === 'master';
              return (
                <div
                  key={course._id}
                  className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isMaster 
                      ? 'lg:scale-110 z-20 ring-2 ring-yellow-400/50 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50' 
                      : 'bg-white hover:shadow-xl'
                  } ${getPackageStyling(course.packageType)}`}
                >
                  {/* Package Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      isMaster 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg' 
                        : getPackageBadgeColor(course.packageType)
                    }`}>
                      {isMaster ? '⭐ PREMIUM' : getPackageBadge(course.packageType)}
                    </span>
                  </div>

                  {/* Premium Glow Effect for Master */}
                  {isMaster && (
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-orange-500/10 to-red-500/10 rounded-2xl"></div>
                  )}

                  {/* Package Image */}
                  <div className={`relative overflow-hidden ${isMaster ? 'h-56' : 'h-48'}`}>
                    {course.courseThumbnail ? (
                      <img
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${
                        isMaster 
                          ? 'from-yellow-400 via-orange-500 to-red-500' 
                          : 'from-blue-400 to-purple-600'
                      } flex items-center justify-center`}>
                        <span className="text-white text-4xl font-bold">
                          {isMaster ? '👑' : '📚'}
                        </span>
                      </div>
                    )}
                    
                    {/* Package Type Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className={`font-bold mb-1 ${
                        isMaster ? 'text-xl' : 'text-lg'
                      }`}>
                        {getPackageTitle(course.packageType)}
                      </h3>
                      <p className="text-sm opacity-90">{getPackageCourseCount(course.packageType)}</p>
                    </div>
                  </div>

                  {/* Package Content */}
                  <div className={`p-6 bg-white ${isMaster ? 'min-h-[320px]' : 'min-h-[280px]'} flex flex-col justify-between`}>
                    {/* Price */}
                    <div className="text-center mb-4">
                      <div className={`font-bold text-gray-900 mb-1 ${
                        isMaster ? 'text-4xl text-yellow-600' : 'text-3xl'
                      }`}>
                        {currency}{Math.round(course.coursePrice)}
                      </div>
                      <p className="text-sm text-gray-600">One-time payment</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 flex-grow">
                      {getPackageFeatures(course.packageType).map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <span className={`mt-0.5 ${
                            isMaster ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {isMaster ? '👑' : '✓'}
                          </span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => navigate(`/package/${course._id}`)}
                      className={`w-full text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                        isMaster
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {isMaster ? 'Get Premium Access' : 'Get Started'}
                    </button>
                  </div>

                  {/* Special Premium Effects for Master */}
                  {isMaster && (
                    <>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse delay-1000 shadow-lg"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* Why Choose Our Platform Section */}
      <div className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform</h2>
            <p className="text-xl text-gray-600">Discover the unique advantages that set us apart from the competition</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Expert-Led Learning</h3>
              <p className="text-gray-600 leading-relaxed">Learn from industry professionals and certified coaches who have real-world experience and success stories to share.</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Proven Results</h3>
              <p className="text-gray-600 leading-relaxed">Our students have achieved remarkable success, with many earning significant income and building successful careers.</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">24/7 Support</h3>
              <p className="text-gray-600 leading-relaxed">Get help whenever you need it with our dedicated support team available round the clock to assist you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Learning Journey Section */}
      <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Learning Journey</h2>
            <p className="text-xl text-gray-600">A structured path to success and growth</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enroll</h3>
              <p className="text-gray-600">Choose your package and start your learning adventure</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Learn</h3>
              <p className="text-gray-600">Access comprehensive courses and expert guidance</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Practice</h3>
              <p className="text-gray-600">Apply your knowledge through hands-on exercises</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn</h3>
              <p className="text-gray-600">Build your income and achieve financial freedom</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">About Our Platform</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                We are passionate about transforming lives through education. Our platform combines cutting-edge technology with proven learning methodologies to create an experience that's both effective and engaging.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                With years of experience in online education, we've helped thousands of students achieve their dreams and build successful careers in their chosen fields.
              </p>
              <Link 
                to="/about-us"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Learn More About Us
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="relative">
              <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1565598621680-94ac0c22b148?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Modern learning environment with students collaborating"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

        
      
      {/* Success Stories Section */}
      <div className="w-full bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-xl text-gray-600">Real people, real results - discover how our platform has changed lives</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl border border-rose-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sarah Johnson</h3>
                <p className="text-gray-600 mb-4">"From struggling student to successful entrepreneur in just 6 months!"</p>
                <div className="text-rose-500 font-semibold">Earned {currency}2L+</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Rahul Sharma</h3>
                <p className="text-gray-600 mb-4">"The Supreme package transformed my career completely!"</p>
                <div className="text-blue-500 font-semibold">Earned {currency}3L+</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl border border-green-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Priya Patel</h3>
                <p className="text-gray-600 mb-4">"24/7 support helped me succeed even with a busy schedule!"</p>
                <div className="text-green-500 font-semibold">Earned {currency}1.5L+</div>
              </div>
            </div>
          </div>
        </div>
      </div>



        <CallToAction />
        <TestimonialsSection /> 
        <Footer />
    </div>
  )
}

export default Home