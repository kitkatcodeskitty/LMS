import React, { useEffect, useRef } from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  const titleRef = useRef(null)
  const descriptionRef = useRef(null)
  const searchRef = useRef(null)
  const sketchRef = useRef(null)

  useEffect(() => {
    // Staggered animation on mount
    const elements = [titleRef.current, descriptionRef.current, searchRef.current]
    
    elements.forEach((el, index) => {
      if (el) {
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px)'
        
        setTimeout(() => {
          el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }, index * 200)
      }
    })

    // Animate sketch with delay
    if (sketchRef.current) {
      sketchRef.current.style.opacity = '0'
      sketchRef.current.style.transform = 'scale(0.8) rotate(-5deg)'
      
      setTimeout(() => {
        sketchRef.current.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        sketchRef.current.style.opacity = '1'
        sketchRef.current.style.transform = 'scale(1) rotate(0deg)'
      }, 800)
    }

    // Floating animation for sketch
    const startFloating = () => {
      if (sketchRef.current) {
        sketchRef.current.style.animation = 'float 6s ease-in-out infinite'
      }
    }
    
    setTimeout(startFloating, 1800)
  }, [])

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-10px) rotate(1deg); }
            50% { transform: translateY(-5px) rotate(-1deg); }
            75% { transform: translateY(-15px) rotate(0.5deg); }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          .animate-fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          
          .animate-slide-in-left {
            animation: slideInLeft 0.8s ease-out forwards;
          }
          
                     .animate-pulse-slow {
             animation: pulse 3s ease-in-out infinite;
           }
           
           @keyframes bounce {
             0%, 100% { transform: translateY(0); }
             50% { transform: translateY(-10px); }
           }
           
           @keyframes rotate {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
           
           .animate-bounce-slow {
             animation: bounce 4s ease-in-out infinite;
           }
           
           .animate-rotate-slow {
             animation: rotate 20s linear infinite;
           }
          
          .hero-gradient {
            background: linear-gradient(135deg, #fef2f2 0%, #f3f4f6 50%, #eff6ff 100%);
          }
          
          .text-shadow {
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
                     .glow-effect {
             /* Removed glow effect */
           }
        `}
      </style>
      
      <div className='flex flex-col items-center justify-center w-full min-h-[90vh] md:pt-0 pt-20 px-7 md:px-0 space-y-7 text-center hero-gradient relative overflow-hidden'>
        
                 {/* Background decorative elements with enhanced animations */}
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-20 left-10 w-20 h-20 bg-rose-200 rounded-full opacity-20 animate-bounce-slow hover:opacity-40 hover:scale-110 transition-all duration-500"></div>
           <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-rotate-slow hover:opacity-40 hover:scale-110 transition-all duration-500" style={{animationDelay: '1s'}}></div>
           <div className="absolute bottom-40 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-pulse-slow hover:opacity-40 hover:scale-110 transition-all duration-500" style={{animationDelay: '2s'}}></div>
         </div>
        
        <h1 
          ref={titleRef}
          className='md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto text-shadow z-10'
        >
          Discover your path with packages designed to align
          <span className='text-rose-500 glow-effect'> with your dreams.</span>
          <img 
            ref={sketchRef}
            src={assets.sketch} 
            alt="sketch" 
            className='md:block hidden absolute -bottom-7 right-0 transition-all duration-1000'
          />
        </h1>

        <p 
          ref={descriptionRef}
          className='md:block hidden text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed z-10'
        >
          We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.
        </p>

        <p 
          ref={descriptionRef}
          className='md:hidden text-gray-500 max-w-sm mx-auto text-base leading-relaxed z-10'
        >
          We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.
        </p>
        
        <div ref={searchRef} className="z-10">
          <SearchBar />
        </div>
        
                 {/* Additional floating elements with enhanced animations */}
         <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-rose-400 rounded-full opacity-60 animate-pulse-slow hover:scale-150 hover:bg-rose-500 transition-all duration-300 cursor-pointer"></div>
         <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-pulse-slow hover:scale-150 hover:bg-blue-500 transition-all duration-300 cursor-pointer" style={{animationDelay: '0.5s'}}></div>
         <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-pulse-slow hover:scale-150 hover:bg-purple-500 transition-all duration-300 cursor-pointer" style={{animationDelay: '1.5s'}}></div>
      </div>
    </>
  )
}

export default Hero