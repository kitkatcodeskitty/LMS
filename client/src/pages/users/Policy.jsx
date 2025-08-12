import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '../../components/users/Footer'

const PrivacyPolicy = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    })
  }, [])

  return (
    <div className="bg-gradient-to-b from-white via-red-50 to-red-100 min-h-screen flex flex-col">
      <section
        className="flex-grow w-full py-20 md:py-36 px-6 md:px-0 text-gray-800"
        data-aos="fade-up"
      >
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-extrabold text-rose-600 mb-8 text-center">
            Privacy Policy
          </h1>

          <div className="space-y-8 text-left text-gray-700 text-base md:text-lg leading-relaxed">

            <section data-aos="fade-right" data-aos-delay="100">
              <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
              <p>
                At Growth Skill, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.
              </p>
            </section>

            <section data-aos="fade-left" data-aos-delay="300">
              <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, enroll in courses, or communicate with us. This may include your name, email address, payment details, and any other information necessary to provide our services.
              </p>
            </section>

            <section data-aos="fade-right" data-aos-delay="500">
              <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
              <p>
                Your information is used to provide and improve our services, process payments, communicate important updates, and personalize your learning experience.
              </p>
            </section>

            <section data-aos="fade-left" data-aos-delay="700">
              <h2 className="text-2xl font-semibold mb-3">Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, or loss.
              </p>
            </section>

            <section data-aos="fade-right" data-aos-delay="900">
              <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
              <p>
                Our website uses cookies to enhance your user experience. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section data-aos="fade-left" data-aos-delay="1100">
              <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
              <p>
                You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at support@growthskill.com.
              </p>
            </section>

            <section data-aos="fade-up" data-aos-delay="1300">
              <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
              </p>
            </section>

            <section data-aos="fade-up" data-aos-delay="1500">
              <p className="italic text-center text-gray-600 mt-10">
                If you have any questions about this policy, please contact us.
              </p>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy
