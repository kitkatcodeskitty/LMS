import React from 'react';
import Footer from '../../components/users/Footer';

const Refund = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Refund Policy</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">⚠️ Important Notice</h3>
              <p className="text-red-700 leading-relaxed">
                <strong>All sales are final.</strong> Once payment has been processed and confirmed, we do not offer refunds under any circumstances. This policy applies to all course purchases, regardless of the reason for the refund request.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We encourage you to carefully review course descriptions, previews, and requirements before making a purchase. Please ensure you understand what you're purchasing and that it meets your learning needs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why No Refunds?</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Digital Content Nature</h3>
                <p className="text-gray-700 text-sm">Our courses are digital products that can be accessed immediately upon purchase. Once accessed, the content cannot be "returned" in the traditional sense.</p>
              </div>
              
              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Fair Access Policy</h3>
                <p className="text-gray-700 text-sm">This policy ensures fair access for all students and prevents abuse of our educational resources.</p>
              </div>
              
              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-700 text-sm">We maintain high standards for all our courses and provide detailed descriptions to help you make informed decisions.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Before You Purchase</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Please Review Before Buying</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-2">
                <li>Read the complete course description and learning objectives</li>
                <li>Check the course duration and content structure</li>
                <li>Review any prerequisites or requirements</li>
                <li>Ensure you have the necessary time to complete the course</li>
                <li>Verify that the course meets your learning goals</li>
                <li>Check system requirements for any software or tools needed</li>
            </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What This Means</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">No Exceptions</h3>
                <p className="text-gray-700 text-sm">This policy applies to all situations including but not limited to: change of mind, technical difficulties, course quality concerns, or any other reason.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Immediate Access</h3>
                <p className="text-gray-700 text-sm">Once payment is confirmed, you will have immediate access to all course materials and content.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Lifetime Access</h3>
                <p className="text-gray-700 text-sm">You retain lifetime access to the course content, so you can revisit materials anytime.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about our no-refund policy or need assistance with your course access, please don't hesitate to contact our support team. We're here to help with any technical issues or course-related questions.
            </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/contact" 
                  className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium inline-block text-center"
                >
                  Contact Support
                </a>
                <button 
                onClick={() => window.open('mailto:growthnepal90@gmail.com?subject=Course Support', '_blank')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Email Us
                </button>
              </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Refund;