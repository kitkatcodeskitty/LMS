import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (
      <div className='flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-red-100/70'>

        <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto'>Discover your path with courses designed to align<span className='text-rose-500'> with your dreams.</span>

          <img src={assets.sketch} alt="sketch" className='md:block hidden absolute -bottom-7 right-0'/>
        </h1>

        <p className='md:block hidden text-gary-500 max-w-2xl mx-auto'>We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.</p>

        <p className='md:hidden text-gray-500 max-w-sm mx-auto'>We combine expert instructors, hands-on learning, and real-world skills to guide you toward a brighter future—on your terms.</p>
        <SearchBar />
      </div>


  )
}

export default Hero