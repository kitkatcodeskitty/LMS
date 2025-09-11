import React from 'react';
import Footer from '../../components/users/Footer';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600">Growth Nepal - Your Fair Place to Learn and Earn</p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-rose-50 to-blue-50 rounded-lg p-6 mb-8 border border-rose-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Our Mission</h2>
          <p className="text-gray-700 text-center leading-relaxed">
            Growth Nepal is committed to providing a fair, transparent, and rewarding platform where individuals can learn valuable skills and earn through our comprehensive referral program. We believe in creating equal opportunities for all our members to grow both personally and financially.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Growth Nepal! By accessing and using our learning platform, you accept and agree to be bound by these terms and conditions. These terms are designed to ensure a fair and transparent experience for all our members. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Fair Learning Environment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Growth Nepal is committed to providing high-quality educational content and a fair learning environment. Our platform offers:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Comprehensive course materials designed by industry experts</li>
              <li>Lifetime access to purchased courses</li>
              <li>Regular content updates and improvements</li>
              <li>Fair and transparent pricing with no hidden fees</li>
              <li>Equal access to all features for all members</li>
              <li>Responsive customer support within 24 hours</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Fair Earning Opportunities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our referral program is designed to be fair and rewarding for all participants. We ensure:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Transparent commission structure with clear earning potential</li>
              <li>Equal opportunity for all members to participate in the referral program</li>
              <li>Fair and timely processing of referral earnings</li>
              <li>No discrimination based on background, location, or previous experience</li>
              <li>Clear guidelines and support for maximizing earning potential</li>
              <li>Regular updates on program improvements and new opportunities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Course Access and Payment</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We maintain fair and transparent payment practices:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Course access is granted within 24-48 hours after payment verification</li>
              <li>All payments are processed securely with proper documentation</li>
              <li>7-day refund policy for unsatisfied customers (subject to fair use policy)</li>
              <li>Lifetime access to purchased courses with no recurring fees</li>
              <li>Clear pricing with no hidden charges or surprise fees</li>
              <li>Multiple payment methods accepted for convenience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. User Rights and Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We respect your rights and expect responsible behavior:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Right to privacy and data protection</li>
              <li>Right to fair treatment and equal opportunities</li>
              <li>Right to clear communication and support</li>
              <li>Responsibility to provide accurate information</li>
              <li>Responsibility to use the platform ethically and legally</li>
              <li>Responsibility to respect other members and their privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Referral Program - Fair Practices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our referral program operates on fair and transparent principles:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>All members who purchase a course are eligible for referral benefits</li>
              <li>Commission rates are clearly displayed and consistently applied</li>
              <li>Earnings are calculated fairly and processed monthly</li>
              <li>No favoritism or special treatment for any member</li>
              <li>Clear guidelines prevent abuse while encouraging legitimate referrals</li>
              <li>Regular audits ensure program integrity and fairness</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To maintain fairness for all members, the following activities are prohibited:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Sharing course content with unauthorized users</li>
              <li>Creating fake accounts or using false information</li>
              <li>Manipulating the referral system through fraudulent means</li>
              <li>Harassment or discrimination against other members</li>
              <li>Attempting to gain unauthorized access to accounts or systems</li>
              <li>Any activity that violates local laws or regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to fair dispute resolution:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>All disputes are handled fairly and impartially</li>
              <li>Clear process for reporting and resolving issues</li>
              <li>Timely response to all complaints and concerns</li>
              <li>Right to appeal decisions through proper channels</li>
              <li>Mediation available for complex disputes</li>
              <li>Transparent communication throughout the process</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We protect your privacy and personal data:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Your personal information is never shared without consent</li>
              <li>Secure data storage and transmission</li>
              <li>Regular security audits and updates</li>
              <li>Clear privacy policy with easy-to-understand language</li>
              <li>Right to access, modify, or delete your personal data</li>
              <li>Compliance with international data protection standards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Platform Modifications</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We continuously improve our platform while maintaining fairness:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Regular updates to improve user experience</li>
              <li>Advance notice of significant changes</li>
              <li>User feedback incorporated into improvements</li>
              <li>Fair transition periods for any policy changes</li>
              <li>Clear communication about all updates</li>
              <li>Maintained backward compatibility when possible</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact and Support</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are here to help and ensure your experience is fair and positive:
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              For any questions, concerns, or feedback about these terms or our platform, please contact us at <strong>growthnepal90@gmail.com</strong>. We are committed to addressing all inquiries promptly and fairly.
            </p>
            
            <div className="bg-gradient-to-r from-rose-50 to-blue-50 border border-rose-200 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Our Commitment to You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Fair Treatment</h4>
                  <p className="text-gray-700 text-sm mb-3">Every member receives equal treatment and opportunities</p>
                  <a 
                    href="/contact" 
                    className="bg-rose-600 text-white px-4 py-2 rounded-md hover:bg-rose-700 transition-colors text-sm font-medium inline-block"
                  >
                    Contact Support
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Transparent Communication</h4>
                  <p className="text-gray-700 text-sm mb-3">Clear, honest communication about all policies and changes</p>
                  <a 
                    href="/help" 
                    className="border border-rose-300 text-rose-700 px-4 py-2 rounded-md hover:bg-rose-100 transition-colors text-sm font-medium inline-block"
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