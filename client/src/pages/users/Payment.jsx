import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Footer from '../../components/users/Footer';

const PaymentPage = () => {
  const location = useLocation();
  const { courseId, courseTitle, coursePrice, currency = '$' } = location.state || {};

  const [referralCode, setReferralCode] = useState('');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [showModal, setShowModal] = useState(false);

  if (!courseId || !courseTitle || coursePrice == null) {
    return (
      <div className="p-8 text-center text-red-600">
        No course data found. Please go back and select a course.
      </div>
    );
  }

  const resetForm = () => {
    setReferralCode('');
    setTransactionId('');
    setPaymentScreenshot(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId) {
      toast.error('Please enter your transaction ID.');
      return;
    }

    if (!paymentScreenshot) {
      toast.error('Please upload a payment screenshot.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      // Accept either affiliate link or code. If link provided, attempt to extract code from URL param 'ref'
      let codeToSend = referralCode;
      if (!codeToSend && affiliateLink) {
        try {
          const url = new URL(affiliateLink.trim());
          const refParam = url.searchParams.get('ref');
          if (refParam) codeToSend = refParam;
        } catch (_) {
          // not a valid URL; ignore and proceed without code
        }
      }
      formData.append('referralCode', codeToSend || '');
      formData.append('transactionId', transactionId);
      formData.append('paymentScreenshot', paymentScreenshot);

      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add course to cart');
      }

      toast.success('Course added to cart successfully! Wait for admin to validate.');

      // Show popup
      setShowModal(true);
      resetForm();
    } catch (error) {
      toast.error('Error: ' + error.message);
    }
  };

  // Close modal handler
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <style>
        {`
          @keyframes popupShow {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>

      <div className="max-w-5xl mx-auto p-8 bg-white rounded shadow mt-10">
        <h2 className="text-2xl font-semibold mb-6 text-center">Complete Your Payment</h2>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Column: QR Code */}
          <div className="flex flex-col items-center lg:w-1/2 text-center">
            <img src="/qr.jpg" alt="Payment QR Code" className="w-48 h-48 mb-3" />

            <p className="text-lg font-bold text-red-600">
              Please pay {currency}
              {coursePrice.toFixed(2)} /- On Above given QR Code
            </p>
            <p className="text-sm font-semibold text-gray-600 mt-2">
              Note: Don't pay amount which is lower or higher than the course price. Please pay
              exact amount otherwise your id will not be activated. and we will not accept any refund.
            </p>
            <p className="text-sm text-gray-600 font-bold mt-2 ">
              Scan the QR code above to make the payment.
            </p>
          </div>

          {/* Right Column: Form */}
          <form onSubmit={handleSubmit} className="lg:w-1/2 space-y-4" encType="multipart/form-data">
            <div>
              <label className="block mb-1 font-medium">Course ID</label>
              <input
                type="text"
                value={courseId}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Course Title</label>
              <input
                type="text"
                value={courseTitle}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Course Price</label>
              <input
                type="text"
                value={`${currency}${coursePrice.toFixed(2)}`}
                readOnly
                className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block mb-1 font-medium">Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your transaction ID"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Affiliate Link or Referral Code */}
            <div>
              <label className="block mb-1 font-medium">Affiliate Link (optional)</label>
              <input
                type="text"
                value={affiliateLink}
                onChange={(e) => setAffiliateLink(e.target.value)}
                placeholder="Paste affiliate link e.g. https://yourapp.com/course/123?ref=ABCD1234"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-2"
              />
              <label className="block mb-1 font-medium">Referral Code (optional)</label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Or enter referral code"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            {/* Payment Screenshot */}
            <div>
              <label className="block mb-1 font-medium">Upload Payment Screenshot</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentScreenshot(e.target.files[0])}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
              <p className="text-sm mb-1 font-semibold">Please Note:</p>
              <ul className="list-disc list-inside text-sm">
                <li>Please scan the QR code above to complete your payment.</li>
                <li>Enter your transaction ID exactly as it appears in your payment receipt.</li>
                <li>Upload a screenshot to help us verify your payment faster.</li>
                <li>Referral code can give you discounts or affiliate benefits.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Proceed with Payment
            </button>
          </form>
        </div>
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded p-6 max-w-sm w-full shadow-lg text-center transform transition-all duration-300 ease-out scale-100 opacity-100"
            style={{
              animation: 'popupShow 0.3s ease forwards',
            }}
          >
            <h3 className="text-xl font-semibold mb-4">Order Placed</h3>
            <p className="mb-6">Your order has been placed. Wait for admin to validate.</p>
            <button
              onClick={closeModal}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default PaymentPage;
