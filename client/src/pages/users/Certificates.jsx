import React, { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Footer from '../../components/users/Footer'
import { 
  FaCertificate, 
  FaTrophy, 
  FaGraduationCap, 
  FaStar, 
  FaDownload, 
  FaShareAlt,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaMedal,
  FaAward,
  FaRocket,
  FaDatabase
} from 'react-icons/fa'

const Certificates = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
    })

    // Simulate loading certificates
    setTimeout(() => {
      setCertificates([
        {
          id: 1,
          title: "Complete Web Development",
          course: "Full Stack Web Development",
          issuedDate: "2024-12-15",
          grade: "A+",
          score: 95,
          status: "completed",
          certificateUrl: "#",
          type: "course",
          duration: "6 months",
          instructor: "John Doe",
          achievements: ["Perfect Score", "Early Completion", "Project Excellence"]
        },
        {
          id: 2,
          title: "JavaScript Mastery",
          course: "Advanced JavaScript Programming",
          issuedDate: "2024-11-20",
          grade: "A",
          score: 88,
          status: "completed",
          certificateUrl: "#",
          type: "skill",
          duration: "3 months",
          instructor: "Jane Smith",
          achievements: ["Skill Mastery", "Code Quality"]
        },
        {
          id: 3,
          title: "React Framework Expert",
          course: "React.js Development",
          issuedDate: "2024-10-10",
          grade: "A+",
          score: 92,
          status: "completed",
          certificateUrl: "#",
          type: "framework",
          duration: "4 months",
          instructor: "Mike Johnson",
          achievements: ["Framework Expert", "Component Design", "State Management"]
        },
        {
          id: 4,
          title: "Database Design",
          course: "SQL & NoSQL Databases",
          issuedDate: "2024-09-15",
          grade: "A",
          score: 87,
          status: "completed",
          certificateUrl: "#",
          type: "database",
          duration: "2 months",
          instructor: "Sarah Wilson",
          achievements: ["Database Design", "Query Optimization"]
        }
      ])
      setLoading(false)
    }, 1500)
  }, [])

  const filteredCertificates = certificates.filter(cert => {
    if (activeTab === 'all') return true
    return cert.type === activeTab
  })

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return <FaGraduationCap className="w-5 h-5" />
      case 'skill': return <FaStar className="w-5 h-5" />
      case 'framework': return <FaRocket className="w-5 h-5" />
      case 'database': return <FaDatabase className="w-5 h-5" />
      default: return <FaCertificate className="w-5 h-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'from-blue-500 to-blue-600'
      case 'skill': return 'from-green-500 to-green-600'
      case 'framework': return 'from-purple-500 to-purple-600'
      case 'database': return 'from-orange-500 to-orange-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getGradeColor = (grade) => {
    if (grade === 'A+') return 'text-green-600 bg-green-100'
    if (grade === 'A') return 'text-blue-600 bg-blue-100'
    if (grade === 'B+') return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center" data-aos="fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
              <FaCertificate className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Certificates
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Celebrate your achievements and showcase your skills with our professional certificates. 
              Download, share, and display your learning accomplishments.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <FaTrophy className="w-4 h-4 mr-2 text-yellow-500" />
                {certificates.length} Certificates Earned
              </span>
              <span className="flex items-center">
                <FaStar className="w-4 h-4 mr-2 text-blue-500" />
                Average Score: {certificates.length > 0 ? Math.round(certificates.reduce((acc, cert) => acc + cert.score, 0) / certificates.length) : 0}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Certificates', count: certificates.length },
                { id: 'course', label: 'Course Certificates', count: certificates.filter(c => c.type === 'course').length },
                { id: 'skill', label: 'Skill Certificates', count: certificates.filter(c => c.type === 'skill').length },
                { id: 'framework', label: 'Framework Certificates', count: certificates.filter(c => c.type === 'framework').length },
                { id: 'database', label: 'Database Certificates', count: certificates.filter(c => c.type === 'database').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="flex-grow w-full py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <FaCertificate className="w-8 h-8 text-white animate-pulse" />
              </div>
              <p className="text-lg text-gray-600">Loading your certificates...</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
                <FaCertificate className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Certificates Yet</h3>
              <p className="text-gray-600 mb-6">Complete courses to earn your first certificate!</p>
              <a
                href="/packages-list"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <FaRocket className="w-4 h-4 mr-2" />
                Browse Courses
              </a>
            </div>
          ) : (
            <div className="grid gap-6 md:gap-8">
              {filteredCertificates.map((cert, index) => (
                <div
                  key={cert.id}
                  className="group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Certificate Icon & Type */}
                      <div className="flex-shrink-0">
                        <div className={`w-20 h-20 bg-gradient-to-r ${getTypeColor(cert.type)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {getTypeIcon(cert.type)}
                        </div>
                      </div>

                      {/* Certificate Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                              {cert.title}
                            </h3>
                            <p className="text-gray-600 mb-2">{cert.course}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <FaClock className="w-4 h-4 mr-1" />
                                {cert.duration}
                              </span>
                              <span className="flex items-center">
                                <FaGraduationCap className="w-4 h-4 mr-1" />
                                {cert.instructor}
                              </span>
                            </div>
                          </div>
                          
                          {/* Grade & Score */}
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(cert.grade)}`}>
                              {cert.grade}
                            </span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">{cert.score}%</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>
                        </div>

                        {/* Achievements */}
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Achievements</h4>
                          <div className="flex flex-wrap gap-2">
                            {cert.achievements.map((achievement, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                              >
                                <FaMedal className="w-3 h-3 mr-1" />
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                            <FaEye className="w-4 h-4 mr-2" />
                            View Certificate
                          </button>
                          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                            <FaDownload className="w-4 h-4 mr-2" />
                            Download PDF
                          </button>
                          <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200">
                            <FaShareAlt className="w-4 h-4 mr-2" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Certificate Footer */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <FaCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Issued on {new Date(cert.issuedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="flex items-center">
                          <FaAward className="w-4 h-4 mr-2 text-yellow-500" />
                          Certificate ID: {cert.id.toString().padStart(6, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Certificates
