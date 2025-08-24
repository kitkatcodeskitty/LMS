import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '../../components/users/Footer'
import { 
  FaShieldAlt, 
  FaDatabase, 
  FaCog, 
  FaCookieBite, 
  FaUserCheck, 
  FaHistory,
  FaEnvelope,
  FaQuestionCircle
} from 'react-icons/fa'

const PrivacyPolicy = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    })
  }, [])

  const policySections = [
    {
      icon: FaShieldAlt,
      title: "Introduction",
      content: "At Growth Skill, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.",
      color: "from-blue-500 to-blue-600",
      delay: 100
    },
    {
      icon: FaDatabase,
      title: "Information We Collect",
      content: "We collect information you provide directly to us when you create an account, enroll in courses, or communicate with us. This may include your name, email address, payment details, and any other information necessary to provide our services.",
      color: "from-purple-500 to-purple-600",
      delay: 200
    },
    {
      icon: FaCog,
      title: "How We Use Your Information",
      content: "Your information is used to provide and improve our services, process payments, communicate important updates, and personalize your learning experience.",
      color: "from-green-500 to-green-600",
      delay: 300
    },
    {
      icon: FaShieldAlt,
      title: "Data Security",
      content: "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, disclosure, or loss.",
      color: "from-red-500 to-red-600",
      delay: 400
    },
    {
      icon: FaCookieBite,
      title: "Cookies",
      content: "Our website uses cookies to enhance your user experience. You can control cookie preferences through your browser settings.",
      color: "from-yellow-500 to-yellow-600",
      delay: 500
    },
    {
      icon: FaUserCheck,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at support@growthskill.com.",
      color: "from-indigo-500 to-indigo-600",
      delay: 600
    },
    {
      icon: FaHistory,
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.",
      color: "from-pink-500 to-pink-600",
      delay: 700
    }
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center" data-aos="fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <FaShieldAlt className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're committed to protecting your privacy and ensuring the security of your personal information. 
              Learn how we collect, use, and safeguard your data.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FaHistory className="w-4 h-4 mr-2" />
                Last updated: December 2024
              </span>
              <span className="flex items-center">
                <FaEnvelope className="w-4 h-4 mr-2" />
                support@growthskill.com
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="flex-grow w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:gap-12">
            {policySections.map((section, index) => (
              <div
                key={index}
                className="group"
                data-aos="fade-up"
                data-aos-delay={section.delay}
              >
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start space-x-6">
                    <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-r ${section.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <section.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                        {section.title}
                      </h2>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div 
            className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center"
            data-aos="fade-up"
            data-aos-delay="800"
          >
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <FaQuestionCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Questions About Privacy?
              </h3>
              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                We're here to help! If you have any questions about our privacy practices or need assistance with your data, don't hesitate to reach out.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <a
                  href="mailto:support@growthskill.com"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaEnvelope className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
                <a
                  href="/help"
                  className="inline-flex items-center px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors duration-200 border border-white/30"
                >
                  <FaQuestionCircle className="w-4 h-4 mr-2" />
                  Help Center
                </a>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center text-gray-500" data-aos="fade-up" data-aos-delay="900">
            <p className="text-sm">
              This privacy policy is effective as of December 2024 and will remain in effect except with respect to any changes in its provisions in the future.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy
