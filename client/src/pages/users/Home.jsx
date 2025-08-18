import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Hero from '../../components/users/Hero'
import TestimonialsSection from '../../components/users/TestimonialsSection'
import CallToAction from '../../components/users/CallToAction'
import Footer from '../../components/users/Footer'

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
  const { allCourses } = useContext(AppContext);

  const randomCourses = useMemo(() => {
    const shuffled = [...allCourses];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  }, [allCourses]);
  
  return (
    <div className='relative flex flex-col items-center text-center overflow-hidden'>
      {/* Inject custom CSS for floating animations */}
      <style>{floatingStyles}</style>
      
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
      <div className="w-full bg-gradient-to-r from-gray-900 to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Learning Packages</h2>
            <p className="text-xl text-gray-300">Discover our most popular courses and start your learning journey today</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              // Sort courses to ensure Supreme is in the middle
              const sortedCourses = [...randomCourses].sort((a, b) => {
                if (a.packageType === 'supreme') return 1; // Supreme goes to middle/end
                if (b.packageType === 'supreme') return -1;
                if (a.packageType === 'elite') return -1; // Elite goes first
                if (b.packageType === 'elite') return 1;
                return 0; // Premium stays in order
              });

              return sortedCourses.map((course, index) => {
                // Get package styling based on package type
                const getPackageStyling = () => {
                  switch (course.packageType) {
                    case 'supreme':
                      return {
                        cardClass: "bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 text-white hover:transform hover:scale-105 transition-all duration-300 relative transform scale-110 shadow-2xl shadow-blue-500/30",
                        iconClass: "w-24 h-24 bg-black/20 rounded-full flex items-center justify-center mx-auto mb-6",
                        iconSize: "w-12 h-12",
                        titleClass: "text-3xl font-bold mb-3",
                        featureClass: "space-y-5",
                        checkmarkClass: "w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center",
                        checkmarkSize: "w-4 h-4",
                        textClass: "text-lg",
                        buttonClass: "w-full mt-8 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3 px-6 rounded-lg font-semibold text-base transition-all duration-300 flex items-center justify-center space-x-2 group",
                        badge: "MOST POPULAR"
                      };
                    case 'elite':
                      return {
                        cardClass: "bg-white rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 border-2 border-rose-500 shadow-lg shadow-rose-500/20",
                        iconClass: "w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4",
                        iconSize: "w-10 h-10",
                        titleClass: "text-2xl font-bold text-gray-900 mb-2",
                        featureClass: "space-y-4",
                        checkmarkClass: "w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center",
                        checkmarkSize: "w-3 h-3",
                        textClass: "text-gray-700",
                        buttonClass: "w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2.5 px-6 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 group",
                        badge: null
                      };
                    case 'premium':
                    default:
                      return {
                        cardClass: "bg-white rounded-2xl p-8 hover:transform hover:scale-105 transition-all duration-300 border border-gray-200 shadow-lg shadow-gray-500/20",
                        iconClass: "w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4",
                        iconSize: "w-10 h-10",
                        titleClass: "text-2xl font-bold text-gray-900 mb-2",
                        featureClass: "space-y-4",
                        checkmarkClass: "w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center",
                        checkmarkSize: "w-3 h-3",
                        textClass: "text-gray-700",
                        buttonClass: "w-full mt-6 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-2.5 px-6 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 group",
                        badge: null
                      };
                  }
                };

                const packageStyle = getPackageStyling();

                return (
                  <div key={course._id || index} className={packageStyle.cardClass}>
                    {/* Package Badge */}
                    {packageStyle.badge && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">{packageStyle.badge}</span>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      <div className={packageStyle.iconClass}>
                        {course.packageType === 'supreme' ? (
                          <svg className={`${packageStyle.iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        ) : course.packageType === 'elite' ? (
                          <svg className={`${packageStyle.iconSize} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        ) : (
                          <svg className={`${packageStyle.iconSize} text-gray-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>
                      <h3 className={packageStyle.titleClass}>
                        {course.packageType === 'supreme' ? 'Supreme Package' : 
                         course.packageType === 'elite' ? 'Elite Package' : 'Premium Package'}
                      </h3>
                    </div>
                    
                    <div className={packageStyle.featureClass}>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>
                          {course.packageType === 'supreme' ? 'You get access to 15 courses' :
                           course.packageType === 'elite' ? 'You get access to 4 courses' : 'You get access to 8 courses'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>Course completion certificate</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>Free access of training system</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>
                          {course.packageType === 'supreme' ? 'Opportunity to earn 50k to 100k' :
                           course.packageType === 'elite' ? 'Opportunity to earn 10k to 15k' : 'Opportunity to earn 20k to 25k'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>Dedicated support system 24x7 day's</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={packageStyle.checkmarkClass}>
                          <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={packageStyle.textClass}>Special training from certified coach</span>
                      </div>
                      {course.packageType === 'premium' && (
                        <div className="flex items-center space-x-3">
                          <div className={packageStyle.checkmarkClass}>
                            <svg className={`${packageStyle.checkmarkSize} text-white`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className={packageStyle.textClass}>Can avail 2 special bonus</span>
                        </div>
                      )}
                    </div>
                    
                    <Link
                      to={`/package/${course._id}`}
                      onClick={() => window.scrollTo(0, 0)}
                      className={packageStyle.buttonClass}
                    >
                      <span>Enroll</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                );
              });
            })()}
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
            {/* Feature 1 */}
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
              <div className="w-full h-80 bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl flex items-center justify-center">
                <svg className="w-32 h-32 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
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
                <div className="text-rose-500 font-semibold">Earned ₹15L+</div>
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
                <div className="text-blue-500 font-semibold">Earned ₹25L+</div>
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
                <div className="text-green-500 font-semibold">Earned ₹12L+</div>
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