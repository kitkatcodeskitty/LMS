import React from 'react'
import { assets } from '../../assets/assets'

const Footer = ({ variant = 'full' }) => {

  const currentYear = new Date().getFullYear()

  // Simple footer for admin pages
  if (variant === 'simple') {
    return (
      <footer className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex md:flex-row flex-col-reverse items-center justify-between py-6">
            <div className='flex items-center gap-4'>
              <img className='hidden md:block w-16 h-auto hover:scale-105 transition-transform duration-300' src="/footer.png" alt='Growth Nepal Logo'/>
              <div className='hidden md:block h-6 w-px bg-gray-300'></div>
              <p className='text-center text-sm text-gray-600 font-medium'>
                © {currentYear} Growth Nepal. All rights reserved.
              </p>
            </div>
            <div className='flex items-center gap-4 max-md:mb-4'>
              <a href='#' className='text-gray-500 hover:text-rose-600 transition-all duration-300 hover:scale-110 transform p-2 rounded-full hover:bg-rose-50'>
                <img src={assets.facebook_icon} alt='facebook' className='w-5 h-5' />
              </a>
              <a href='#' className='text-gray-500 hover:text-rose-600 transition-all duration-300 hover:scale-110 transform p-2 rounded-full hover:bg-rose-50'>
                <img src={assets.twitter_icon} alt='twitter' className='w-5 h-5' />
              </a>
              <a href='#' className='text-gray-500 hover:text-rose-600 transition-all duration-300 hover:scale-110 transform p-2 rounded-full hover:bg-rose-50'>
                <img src={assets.instagram_icon} alt='instagram' className='w-5 h-5' />
              </a>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  // Full footer for user pages
  return (
    <footer className='bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 w-full mt-20 relative overflow-hidden'>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-700/20 opacity-30"></div>
      
      {/* Main Footer Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>


        {/* Main Footer Links */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 py-16'>
          
          {/* Company Info */}
          <div className='lg:col-span-2 space-y-6'>
            <div className="group">
              <img className='h-14 w-auto hover:scale-105 transition-transform duration-300' src="/footer.png" alt='Growth Nepal Logo' />
            </div>
            <p className='text-white/80 text-base leading-relaxed max-w-md'>
              Empowering learners worldwide with cutting-edge online education. Transform your career with our comprehensive learning platform designed for the future.
            </p>
            
            {/* Contact Info */}
            <div className='space-y-4'>
              <div className='flex items-center space-x-3 text-white/70'>
                <svg className='w-5 h-5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
                <span>growthnepal90@gmail.com</span>
              </div>
              <div className='flex items-center space-x-3 text-white/70'>
                <svg className='w-5 h-5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                </svg>
                <span>+977 9800000000</span>
              </div>
              <div className='flex items-center space-x-3 text-white/70'>
                <svg className='w-5 h-5 text-rose-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                </svg>
                <span>Kathmandu, Nepal</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className='flex space-x-4 pt-4'>
              <a href='#' className='text-white/60 hover:text-white transition-all duration-300 p-3 rounded-full bg-white/5 hover:bg-rose-600/20 hover:scale-110 transform border border-white/10 hover:border-rose-500/50 group'>
                <svg className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'/>
                </svg>
              </a>
              <a href='#' className='text-white/60 hover:text-white transition-all duration-300 p-3 rounded-full bg-white/5 hover:bg-rose-600/20 hover:scale-110 transform border border-white/10 hover:border-rose-500/50 group'>
                <svg className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'/>
                </svg>
              </a>
              <a href='#' className='text-white/60 hover:text-white transition-all duration-300 p-3 rounded-full bg-white/5 hover:bg-rose-600/20 hover:scale-110 transform border border-white/10 hover:border-rose-500/50 group'>
                <svg className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z'/>
                </svg>
              </a>
              <a href='#' className='text-white/60 hover:text-white transition-all duration-300 p-3 rounded-full bg-white/5 hover:bg-rose-600/20 hover:scale-110 transform border border-white/10 hover:border-rose-500/50 group'>
                <svg className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-6'>
            <h3 className='font-bold text-white text-lg border-l-4 border-rose-500 pl-4'>Quick Links</h3>
            <ul className='space-y-4'>
              <li>
                <a href='/' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href='/packages-list' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Courses</span>
                </a>
              </li>
              <li>
                <a href='/about-us' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href='/contact' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Contact</span>
                </a>
              </li>
              <li>
                <a href='/my-enrollments' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>My Enrollments</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Learning */}
          <div className='space-y-6'>
            <h3 className='font-bold text-white text-lg border-l-4 border-rose-500 pl-4'>Learning</h3>
            <ul className='space-y-4'>
              <li>
                <a href='/packages-list' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Browse Courses</span>
                </a>
              </li>
              <li>
                <a href='/my-enrollments' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>My Learning</span>
                </a>
              </li>

              
            </ul>
          </div>

          {/* Support & Legal */}
          <div className='space-y-6'>
            <h3 className='font-bold text-white text-lg border-l-4 border-rose-500 pl-4'>Support</h3>
            <ul className='space-y-4'>
              <li>
                <a href='/help' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <a href='/faq' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <a href='/policy' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href='/terms' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Terms of Service</span>
                </a>
              </li>
              <li>
                <a href='/refund' className='text-white/80 hover:text-white transition-all duration-300 text-sm flex items-center group hover:translate-x-2 transform'>
                  <svg className='w-4 h-4 mr-3 text-rose-500 group-hover:scale-110 transition-transform duration-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 5l7 7-7 7' />
                  </svg>
                  <span>Refund Policy</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className='py-8 border-t border-white/10 '>
          <div className='flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0'>
            <div className='text-white/60 text-sm text-center lg:text-left order-2 lg:order-1'>
              <p className='mb-2'>© {currentYear} Growth Nepal. All rights reserved.</p>
              <p className='text-xs text-white/40'>Designed with ❤️ Growth Nepal Dev Teams!</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer