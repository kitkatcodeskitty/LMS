import React from 'react';
import Footer from '../../components/users/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using our Learning Management System platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Permission is granted to temporarily access the materials on our platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on the platform</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Course Access and Payment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Course access is granted upon successful payment verification by our administrative team. Payment verification typically takes 24-48 hours. All payments must be made through our approved payment methods with valid transaction documentation.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Course fees are non-refundable after 7 days of purchase</li>
              <li>Access to courses is granted for lifetime once payment is verified</li>
              <li>Users must provide accurate payment information and transaction details</li>
              <li>False or fraudulent payment information may result in account termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Users are responsible for maintaining the confidentiality of their account credentials and for all activities that occur under their account. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Provide accurate and complete information during registration</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Referral Program</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our referral program allows users who have purchased at least one course to earn commissions by referring new students. Referral program terms include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Users must purchase a course before accessing referral features</li>
              <li>Commission rates are subject to change with notice</li>
              <li>Referral earnings are processed monthly</li>
              <li>Fraudulent referral activity may result in account suspension</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Uses</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You may not use our platform for any unlawful purpose or to solicit others to perform unlawful acts. Prohibited activities include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Sharing course content with unauthorized users</li>
              <li>Creating multiple accounts to abuse referral programs</li>
              <li>Using automated systems to access the platform</li>
              <li>Attempting to gain unauthorized access to other user accounts</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The materials on our platform are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitations</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              In no event shall our company or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on our platform, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may revise these terms of service at any time without notice. By using this platform, you are agreeing to be bound by the then current version of these terms of service. We will notify users of significant changes via email or platform notifications.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact our support team through the help center or email us directly. We are committed to addressing your concerns promptly and professionally.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4">Need Help Understanding These Terms?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Contact Support</h4>
                  <p className="text-blue-700 text-sm mb-3">Get clarification on any terms or policies</p>
                  <a 
                    href="/contact" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-block"
                  >
                    Contact Us
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">Browse Documentation</h4>
                  <p className="text-blue-700 text-sm mb-3">Find answers in our help center</p>
                  <a 
                    href="/help" 
                    className="border border-blue-300 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium inline-block"
                  >
                    Help Center
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;