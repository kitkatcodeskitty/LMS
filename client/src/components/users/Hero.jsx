import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const carouselRef = useRef(null)

  const navigate = useNavigate()

  // Hero slides data
  const heroSlides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1743327608361-698da1c56900?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: {
        line1: "Discover your path with",
        line2: "packages designed to",
        line3: "align with your",
        line4: "dreams"
      },
      description: "We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.",
      buttonText: "Get Started Today"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1531535807748-218331acbcb4?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: {
        line1: "Transform your future with",
        line2: "comprehensive learning",
        line3: "programs built for",
        line4: "success"
      },
      description: "Join thousands of students who have already transformed their careers with our industry-leading courses and expert mentorship.",
      buttonText: "Explore Courses"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1598929214025-d6bb6167d43b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: {
        line1: "Master new skills with",
        line2: "personalized learning",
        line3: "experiences designed",
        line4: "for you"
      },
      description: "Experience adaptive learning that adjusts to your pace and style, ensuring you get the most out of every lesson.",
      buttonText: "Start Learning"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1621570277374-2e43db60c464?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: {
        line1: "Build your career with",
        line2: "cutting-edge technology",
        line3: "and innovative",
        line4: "solutions"
      },
      description: "Stay ahead of the curve with our technology-focused programs that prepare you for the jobs of tomorrow.",
      buttonText: "View Programs"
    }
  ]

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return
    setIsTransitioning(true)
    setCurrentSlide(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleGetStarted = () => {
    navigate('/packages-list')
  }

  return (
    <div className='w-full py-16 relative overflow-hidden bg-gradient-to-br from-red-50 via-gray-100 to-blue-50'>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-gradient-to-br from-rose-200 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
          <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Carousel Navigation Buttons */}
        <button 
          onClick={prevSlide}
          disabled={isTransitioning}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          disabled={isTransitioning}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Container */}
        <div className="relative z-10 overflow-hidden w-full">
          <div 
            ref={carouselRef}
            className="flex transition-transform duration-500 ease-out"
            style={{ 
              width: `${heroSlides.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / heroSlides.length)}%)` 
            }}
          >
            {heroSlides.map((slide, index) => (
              <div key={slide.id} style={{ width: `${100 / heroSlides.length}%` }} className="flex-shrink-0">
                <div className='max-w-7xl mx-auto px-4'>
                  {/* Mobile Layout: Heading -> Image -> Description -> Button */}
                  <div className='lg:hidden space-y-8 opacity-100 transform translate-y-0 transition-opacity duration-600 transition-transform duration-600'>
                    {/* Heading - Center Aligned with Inverted Pyramid Structure */}
                    <div className='text-center space-y-4'>
                      <h1 className='text-3xl font-bold text-gray-900 leading-tight'>
                        <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                          {slide.title.line1}
                        </span>
                        <br />
                        <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                          {slide.title.line2}
                        </span>
                        <br />
                        <span className='text-gray-900'>{slide.title.line3}</span>
                        <br />
                        <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                          {slide.title.line4}
                        </span>
                      </h1>
                    </div>

                    {/* Image - Mobile First */}
                    <div className='flex justify-center'>
                      <div className='relative overflow-hidden'>
                        <div className='w-72 h-80 rounded-2xl overflow-hidden shadow-2xl relative'>
                          {/* Main Image */}
                          <img 
                            src={slide.image}
                            alt="Student learning and improving skills"
                            className="w-full h-full object-cover transition-all duration-800 ease-in-out opacity-100"
                          />
                          
                          {/* Gradient overlay for better text contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                        </div>
                        
                        {/* Floating elements around the image */}
                        <div className='absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center shadow-lg border border-rose-200'>
                          <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        
                        <div className='absolute -bottom-3 -right-3 w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg border border-purple-200'>
                          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Description - Center Aligned */}
                    <div className='text-center'>
                      <p className='text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto'>
                        {slide.description}
                      </p>
                    </div>

                    {/* Button - Center Aligned */}
                    <div className='flex justify-center'>
                                              <button onClick={handleGetStarted} className='bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl'>
                        {slide.buttonText}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout: Left Text, Right Image */}
                  <div className='hidden lg:flex flex-row items-center justify-between gap-12 opacity-100 transform translate-y-0 transition-opacity duration-600 transition-transform duration-600'>
                    
                    {/* Left Side - Text Content */}
                    <div className='flex-1 text-left space-y-8 z-10'>
                      <div className='space-y-4'>
                        <h1 className='text-4xl font-bold text-gray-900 leading-tight'>
                          <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                            {slide.title.line1}
                          </span>
                          <br />
                          <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                            {slide.title.line2}
                          </span>
                          <br />
                          <span className='text-gray-900'>{slide.title.line3}</span>
                          <br />
                          <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                            {slide.title.line4}
                          </span>
                        </h1>
                      </div>

                      <p className='text-xl text-gray-600 leading-relaxed max-w-2xl'>
                        {slide.description}
                      </p>

                      <div className='space-y-6'>
                        <button onClick={handleGetStarted} className='bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl'>
                          {slide.buttonText}
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Right Side - Hero Image */}
                                          <div className='flex-1 flex justify-center lg:justify-end'>
                      <div className='relative overflow-hidden'>
                        <div className='w-80 h-96 lg:w-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl relative'>
                          {/* Main Image */}
                          <img 
                            src={slide.image}
                            alt="Student learning and improving skills"
                            className="w-full h-full object-cover transition-all duration-800 ease-in-out opacity-100"
                          />
                          
                          {/* Gradient overlay for better text contrast */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                        </div>
                        
                        {/* Floating elements around the image */}
                        <div className='absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center shadow-lg border border-rose-200'>
                          <svg className="w-8 h-8 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        
                        <div className='absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg border border-purple-200'>
                          <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex space-x-3">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
  )
}

export default Hero