import React from 'react'
import Hero from '../../components/users/Hero'
import Companies from '../../components/users/Companies'
import CoursesSection from '../../components/users/CoursesSection'
import TestimonialsSection from '../../components/users/TestimonialsSection'
import CallToAction from '../../components/users/CallToAction'
import Footer from '../../components/users/Footer'

const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
        <Hero />
        <Companies />
        <CoursesSection />
        <TestimonialsSection /> 
        <CallToAction />
        <Footer />
    </div>
  )
}

export default Home