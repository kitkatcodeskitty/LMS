import React, { useEffect, useRef } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const imageRef = useRef(null)

  const navigate = useNavigate()

  // Single hero image
  const heroImage = "https://images.unsplash.com/photo-1743327608361-698da1c56900?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

  useEffect(() => {
    // Staggered animation on mount
    const elements = [titleRef.current, descriptionRef.current, imageRef.current]
    
    elements.forEach((el, index) => {
      if (el) {
        el.style.opacity = '0'
        el.style.transform = index < 2 ? 'translateY(20px)' : 'translateX(20px)'
        
        setTimeout(() => {
          el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0) translateX(0)'
        }, index * 150)
      }
    })
  }, [])

  const handleGetStarted = () => {
    navigate('/packages-list')
  }

  return (
    <>
      <style>
        {`
          .hero-gradient {
            background: linear-gradient(135deg, #fef2f2 0%, #f3f4f6 50%, #eff6ff 100%);
          }
          
          .hero-button {
            background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
            transition: all 0.3s ease;
          }
          
          .hero-button:hover {
            background: linear-gradient(135deg, #db2777 0%, #9333ea 100%);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(236, 72, 153, 0.3);
          }

          .image-container {
            position: relative;
            overflow: hidden;
          }

          .hero-image {
            transition: all 0.8s ease-in-out;
            opacity: 1;
            filter: brightness(1) contrast(1);
          }
        `}
      </style>
      
      <div className='w-full hero-gradient py-16 relative overflow-hidden'>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[300px] h-[300px] bg-gradient-to-br from-rose-200 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
          <div className="absolute -bottom-40 -left-40 w-[300px] h-[300px] bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        {/* Main Hero Section */}
        <div className='max-w-7xl mx-auto px-4 relative z-10'>
          {/* Mobile Layout: Heading -> Image -> Description -> Button */}
          <div className='lg:hidden space-y-8'>
            {/* Heading - Center Aligned with Inverted Pyramid Structure */}
            <div ref={titleRef} className='text-center space-y-4'>
              <h1 className='text-3xl font-bold text-gray-900 leading-tight'>
                <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                  Discover your path with 
                </span>
                <br />
                <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                  packages designed to 
                </span>
                <br />
                <span className='text-gray-900'>align with your</span>
                <br />
                <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                  dreams
                </span>
              </h1>
            </div>

            {/* Image - Mobile First */}
            <div ref={imageRef} className='flex justify-center'>
              <div className='relative image-container'>
                <div className='w-72 h-80 rounded-2xl overflow-hidden shadow-2xl relative'>
                  {/* Main Image */}
                  <img 
                    src={heroImage}
                    alt="Student learning and improving skills"
                    className="hero-image w-full h-full object-cover"
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
            <div ref={descriptionRef} className='text-center'>
              <p className='text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto'>
                We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.
              </p>
            </div>

            {/* Button - Center Aligned */}
            <div className='flex justify-center'>
              <button onClick={handleGetStarted} className='hero-button text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 shadow-lg'>
                Get Started Today
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Layout: Left Text, Right Image */}
          <div className='hidden lg:flex flex-row items-center justify-between gap-12'>
            
            {/* Left Side - Text Content */}
            <div className='flex-1 text-left space-y-8 z-10'>
              <div ref={titleRef} className='space-y-4'>
                <h1 className='text-4xl font-bold text-gray-900 leading-tight'>
                  <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                    Discover your path with packages
                  </span>
                  <br />
                  <span className='text-gray-900'>designed to align</span>
                  <br />
                  <span className='bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent'>
                    with your dreams
                  </span>
                </h1>
              </div>

              <p 
                ref={descriptionRef}
                className='text-xl text-gray-600 leading-relaxed max-w-2xl'
              >
                We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.
              </p>

              <div className='space-y-6'>
                <button onClick={handleGetStarted} className='hero-button text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 shadow-lg'>
                  Get Started Today
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Right Side - Hero Image */}
            <div ref={imageRef} className='flex-1 flex justify-center lg:justify-end'>
              <div className='relative image-container'>
                <div className='w-80 h-96 lg:w-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-2xl relative'>
                  {/* Main Image */}
                  <img 
                    src={heroImage}
                    alt="Student learning and improving skills"
                    className="hero-image w-full h-full object-cover"
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
    </>
  )
}

export default Hero