import React, { useState } from 'react';
import Footer from '../../components/users/Footer';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account?",
          answer: "To create an account, click the 'Sign Up' button on the homepage, fill in your details including name, email, and password, then verify your email address."
        },
        {
          question: "How do I browse and purchase courses?",
          answer: "Browse our course catalog by clicking 'Courses' in the navigation. You can filter by category, price, or difficulty. Click on any course to view details and purchase."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods including credit cards, debit cards, and digital wallets. All payments are processed securely through our payment gateway."
        }
      ]
    },
    {
      category: "Course Access",
      questions: [
        {
          question: "How do I access my purchased courses?",
          answer: "After purchase and admin approval, you can access your courses through 'My Enrollments' in your account dashboard or navigation menu."
        },
        {
          question: "Can I download course materials?",
          answer: "Yes, most courses include downloadable materials such as PDFs, worksheets, and resources that you can access from your course dashboard."
        },
        {
          question: "How long do I have access to a course?",
          answer: "Once purchased and approved, you have lifetime access to your courses. You can revisit the content anytime at your own pace."
        }
      ]
    },
    {
      category: "Payments & Refunds",
      questions: [
        {
          question: "How long does payment verification take?",
          answer: "Payment verification typically takes 24-48 hours. Our admin team reviews all payment screenshots and transaction details before approving course access."
        },
        {
          question: "What is your refund policy?",
          answer: "We offer refunds within 7 days of purchase if you haven't accessed the course content. Please contact support with your transaction details for refund requests."
        },
        {
          question: "Why was my payment rejected?",
          answer: "Payments may be rejected due to incorrect transaction details, insufficient payment amount, or unclear payment screenshots. Please ensure all details match exactly."
        }
      ]
    },
    {
      category: "Referral Program",
      questions: [
        {
          question: "How does the referral program work?",
          answer: "Share your unique referral code or link with others. When they purchase a course using your code, you earn a commission. You need to purchase at least one course to access referral features."
        },
        {
          question: "How much commission do I earn?",
          answer: "Commission rates vary based on the course and promotional periods. Check your referral dashboard for current rates and earnings."
        },
        {
          question: "When do I receive my referral earnings?",
          answer: "Referral earnings are processed monthly. You can track your earnings and payment history in your profile dashboard."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          question: "What browsers are supported?",
          answer: "Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. Please ensure your browser is updated to the latest version."
        },
        {
          question: "I'm having trouble playing videos",
          answer: "Video playback issues are often resolved by clearing your browser cache, checking your internet connection, or trying a different browser."
        },
        {
          question: "Is there a mobile app?",
          answer: "Currently, our platform is web-based and mobile-responsive. You can access all features through your mobile browser with full functionality."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">Find quick answers to common questions</p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">{category.category}</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {category.questions.map((faq, questionIndex) => {
                  const itemKey = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems[itemKey];
                  
                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900 pr-4">
                            {faq.question}
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            If you can't find the answer you're looking for, don't hesitate to reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700 transition-colors font-medium inline-block text-center"
            >
              Contact Support
            </a>
            <a 
              href="/help" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium inline-block text-center"
            >
              Browse Help Center
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;