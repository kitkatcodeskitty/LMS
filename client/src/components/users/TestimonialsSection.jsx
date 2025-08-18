import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialsSection = () => {
  return (
    <div className='w-full max-w-7xl mx-auto py-20 px-4'>
      <div className="text-center mb-16">
        <h2 className='text-4xl font-bold text-gray-800 mb-4'>What Our Learners Say</h2>
        <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
          Hear from our learners as they share their thoughts and journey of transformation, success, and how our platform has made a difference in their lives.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {dummyTestimonial.map((testimonial, index)=>(
          <div key={index} className='text-left bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden border border-gray-100'>

            <div className='flex items-center gap-4 mb-6'> 
              <img className='h-14 w-14 rounded-full border-2 border-gray-200' src={testimonial.image} alt={testimonial.name} />
              
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>{testimonial.name}</h3>
                <p className='text-gray-600'>{testimonial.role}</p>
              </div>
            </div>
            
            <div>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_,i)=>(
                  <img className='h-5' key={i} src={i < Math.floor(testimonial.rating) ? assets.star: assets.star_blank} alt='star'/>
                ))}
              </div>
              <p className='text-gray-600 leading-relaxed'>{testimonial.feedback}</p>
              <a href='' className='inline-block mt-4 text-rose-600 hover:text-rose-700 font-medium transition-colors duration-200'>Read more →</a>
            </div>
          </div>
        ))}
      </div>
    </div>

  )
}

export default TestimonialsSection