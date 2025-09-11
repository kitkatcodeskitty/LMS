import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '../../components/users/Footer'

const AboutUs = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <div className="bg-gradient-to-b from-white via-red-50 to-red-100 min-h-screen flex flex-col">
      <section 
        className="flex-grow relative w-full py-10 px-6 md:px-0 flex flex-col items-center text-center text-gray-800"
      >

        <div 
          className="max-w-4xl space-y-6 md:space-y-8 relative"
          data-aos="zoom-in"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight md:leading-snug max-w-3xl mx-auto tracking-tight">
            About <span className="text-rose-600">Growth Nepal</span>
          </h2>

          <p 
            className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed" 
            data-aos="fade-down" 
            data-aos-delay="200"
          >
            At Growth Nepal, we believe learning is the bridge between potential and achievement.
            We provide industry-relevant packages in leadership, communication, personal productivity,
            and more — designed to help you thrive in an ever-changing world.
          </p>
        </div>


        <div 
          className="flex flex-col md:flex-row items-center justify-center gap-12 mt-14 max-w-6xl w-full px-4 md:px-0"
        >

          <div className="flex-1" data-aos="flip-left" data-aos-delay="300">
            <img 
              src="https://zealhrconsulting.com/wp-content/uploads/2024/10/contact-banner_o.png"
              alt="Team collaborating"
            />
          </div>

          <div 
            className="flex-1 max-w-xl text-gray-700 text-left text-base md:text-lg leading-relaxed"
            data-aos="fade-up-right"
            data-aos-delay="500"
          >
            <p>
              Our mission is simple — to empower individuals with the skills, confidence, and
              mindset they need to lead, innovate, and succeed. Whether you're advancing your career,
              starting a business, or simply eager to learn, we are here to guide your journey.
            </p>
            <p className="mt-4">
              With expert instructors, hands-on learning methods, and a supportive community, Growth Nepal 
              transforms education into real-world results.
            </p>
          </div>
        </div>


        <div 
          className="mt-20 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-8 text-center text-gray-800"
        >
          {[
            { title: 'Expert-Led Learning', desc: 'Packages taught by industry leaders and proven experts.' },
            { title: 'Practical Skills', desc: 'Real-world projects and exercises to apply your knowledge.' },
            { title: 'Global Community', desc: 'Network with learners and professionals worldwide.' },
          ].map(({ title, desc }, i) => (
            <div 
              key={i} 
              className="flex flex-col items-center px-6 py-8 rounded-2xl shadow-md bg-white transform hover:-translate-y-2 hover:shadow-xl transition duration-500 ease-in-out"
              data-aos="zoom-in-up"
              data-aos-delay={600 + i * 200}
            >
              <h3 className="text-xl font-bold text-rose-600">{title}</h3>
              <p className="mt-3 text-gray-600 text-sm md:text-base">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default AboutUs
