import React from 'react';
import Footer from '../../components/users/Footer';

const Help = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600">Find answers to common questions and get support</p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help articles..."
              className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Getting Started</h3>
            <p className="text-gray-600 mb-4">Learn how to create an account, browse courses, and make your first purchase.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• How to register</li>
              <li>• Browsing courses</li>
              <li>• Making payments</li>
              <li>• Account verification</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Payments & Billing</h3>
            <p className="text-gray-600 mb-4">Information about payment methods, billing, and refunds.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Payment methods</li>
              <li>• Transaction issues</li>
              <li>• Refund requests</li>
              <li>• Billing questions</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Course Access</h3>
            <p className="text-gray-600 mb-4">Help with accessing your courses and learning materials.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Accessing courses</li>
              <li>• Video playback issues</li>
              <li>• Download materials</li>
              <li>• Progress tracking</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Management</h3>
            <p className="text-gray-600 mb-4">Manage your profile, settings, and account preferences.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Profile settings</li>
              <li>• Password reset</li>
              <li>• Email preferences</li>
              <li>• Account deletion</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Technical Support</h3>
            <p className="text-gray-600 mb-4">Get help with technical issues and troubleshooting.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Browser compatibility</li>
              <li>• Connection issues</li>
              <li>• Mobile app support</li>
              <li>• System requirements</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-rose-600 text-3xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Referral Program</h3>
            <p className="text-gray-600 mb-4">Learn about our referral program and earning commissions.</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• How referrals work</li>
              <li>• Commission structure</li>
              <li>• Payment schedules</li>
              <li>• Referral tracking</li>
            </ul>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium inline-block"
            >
              Contact Support
            </a>
            <button 
              onClick={() => window.open('mailto:growthnepal90@gmail.com', '_blank')}
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Email Us
            </button>
          </div>
          
          {/* Additional Contact Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-rose-600 text-2xl mb-2">📧</div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
                <p className="text-gray-600">growthnepal90@gmail.com</p>
                <p className="text-gray-500">24-hour response time</p>
              </div>
              <div>
                <div className="text-rose-600 text-2xl mb-2">💬</div>
                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                <p className="text-gray-600">9 AM - 6 PM</p>
                <p className="text-gray-500">Monday to Friday</p>
              </div>
              <div>
                <div className="text-rose-600 text-2xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-900">Documentation</h3>
                <p className="text-gray-600">Comprehensive guides</p>
                <p className="text-gray-500">Self-service resources</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Help;