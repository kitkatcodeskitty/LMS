import React from 'react';
import Footer from '../../components/users/Footer';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">Get in touch with our support team</p>
        </div>

          {/* Contact Information */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-md p-12 max-w-md w-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Support</h2>
              <p className="text-lg text-gray-600 mb-2">growthnepal90@gmail.com</p>
              <p className="text-sm text-gray-500 mb-8">We'll respond within 24 hours</p>
              
              <a
                href="mailto:growthnepal90@gmail.com"
                className="inline-flex items-center px-8 py-3 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                Send Email
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;