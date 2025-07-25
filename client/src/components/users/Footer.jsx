import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-rose-700 md:px-36 text-left w-full mt-10'>
        <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
          <div className='flex flex-col md:items-start items-center w-full'>
            <img className='w-7/12' src={ assets.logo_dark} alt='logo' />
            <p className='mt-6 text-center md:text-left text-sm text-white/80'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Totam debitis repellendus beatae ad obcaecati dolores. Cumque reprehenderit </p>
          </div>
          <div className='flex flex-col md:items-start items-center w-full'>
            <h2 className='font-semibold text-white mg-5'>Company</h2>
            <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
              <li><a href=''>Home</a> </li>
              <li><a href=''>About Us</a> </li>
              <li><a href=''>Contact us</a> </li>
              <li><a href=''>Privacy policy</a> </li>
            </ul>
          </div>
          <div className='hidden md:flex flex-col items-start w-full'>
            <h1 className='font-semibold text-white mb-5'>Subscribe to our newsLetter</h1>
            <p className='text-sm text-white/80'>The latest news, article, and resources, sent to your inbox weekly</p>
            <div className='flex items-center gap-2 pt-4'>
              <input type='email' placeholder='Enter your email' className='border border-rose-500/30 bg-rose-800 text-rose-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm' />
              <button className='bg-blue-600 w-24 h-9 text-white rounded' >Subscribe</button>
            </div>


          </div>

        </div>
        <p className='py-4 text-center text-xs md:text-sm text-white/60'>Copyright 2025 chorna payinna hai </p>
    </footer>
  )
}

export default Footer