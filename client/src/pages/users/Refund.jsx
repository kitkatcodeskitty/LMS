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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to You</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We want you to be completely satisfied with your course purchases. This refund policy outlines the conditions under which refunds are available and the process for requesting them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Eligibility</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-3">✅ You are eligible for a refund if:</h3>
              <ul className="list-disc list-inside text-green-700 space-y-2">
                <li>You request a refund within 7 days of your course purchase</li>
                <li>You have not accessed more than 20% of the course content</li>
                <li>You have not downloaded course materials or certificates</li>
                <li>Your payment was processed successfully and verified by our team</li>
                <li>You have a valid reason for the refund request</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Refunds are not available if:</h3>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>More than 7 days have passed since your purchase</li>
                <li>You have completed more than 20% of the course</li>
                <li>You have downloaded course materials or received certificates</li>
                <li>The refund request is made for reasons beyond our control</li>
                <li>You have violated our terms of service</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-rose-50 rounded-lg">
                <div className="text-3xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Submit Request</h3>
                <p className="text-gray-600 text-sm">Contact our support team with your refund request and transaction details</p>
              </div>
              
              <div className="text-center p-6 bg-yellow-50 rounded-lg">
                <div className="text-3xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Review</h3>
                <p className="text-gray-600 text-sm">Our team reviews your request and course usage within 2-3 business days</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Process</h3>
                <p className="text-gray-600 text-sm">If approved, refunds are processed within 5-7 business days</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Methods</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Refunds will be processed using the same payment method used for the original purchase:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Credit/Debit Cards:</strong> 5-7 business days to appear on your statement</li>
              <li><strong>Digital Wallets:</strong> 3-5 business days to reflect in your account</li>
              <li><strong>Bank Transfers:</strong> 7-10 business days depending on your bank</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Special Circumstances</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-rose-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Technical Issues</h3>
                <p className="text-gray-700 text-sm">If you experience technical difficulties that prevent you from accessing your course, we may offer a full refund regardless of the time limit.</p>
              </div>
              
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Course Quality Issues</h3>
                <p className="text-gray-700 text-sm">If a course doesn't meet the quality standards described, we may offer a refund or course replacement.</p>
              </div>
              
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-2">Duplicate Purchases</h3>
                <p className="text-gray-700 text-sm">Accidental duplicate purchases will be refunded in full once verified by our team.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request a Refund</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">To request a refund, please contact our support team with the following information:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>Your full name and email address</li>
                <li>Transaction ID or order number</li>
                <li>Course name and purchase date</li>
                <li>Reason for refund request</li>
                <li>Any supporting documentation</li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/contact" 
                  className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium inline-block text-center"
                >
                  Contact Support
                </a>
                <button 
                  onClick={() => window.open('mailto:support@lms.com?subject=Refund Request', '_blank')}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Email Us
                </button>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about our refund policy or need assistance with a refund request, please don't hesitate to contact our support team. We're here to help and will respond to your inquiry within 24 hours.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Refund;