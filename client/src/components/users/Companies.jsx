import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <p className='text-lg text-gray-600'>Trusted by learners from leading companies worldwide</p>
      </div>
      <div className='flex flex-wrap items-center justify-center gap-12 md:gap-20'>
        <img src={assets.microsoft_logo} alt="microsoft" className='w-24 md:w-32 opacity-70 hover:opacity-100 transition-opacity duration-300'/>
        <img src={assets.walmart_logo} alt="walmart" className='w-24 md:w-32 opacity-70 hover:opacity-100 transition-opacity duration-300'/>
        <img src={assets.accenture_logo} alt="accenture" className='w-24 md:w-32 opacity-70 hover:opacity-100 transition-opacity duration-300'/>
        <img src={assets.adobe_logo} alt="adobe" className='w-24 md:w-32 opacity-70 hover:opacity-100 transition-opacity duration-300'/>
        <img src={assets.paypal_logo} alt="paypal" className='w-24 md:w-32 opacity-70 hover:opacity-100 transition-opacity duration-300'/>
      </div>
    </div>
  )
}

export default Companies