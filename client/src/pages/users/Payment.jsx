import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Footer from '../../components/users/Footer';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, getToken, currency: appCurrency, userData } = useContext(AppContext);
  const { courseId, courseTitle, coursePrice, currency = appCurrency, referralCode: initialReferralCode } = location.state || {};

  const [referralCode, setReferralCode] = useState(initialReferralCode || '');
  const [affiliateLink, setAffiliateLink] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  if (!courseId || !courseTitle || coursePrice == null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center max-w-md" padding="lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Package Data Missing</h2>
        <p className="text-gray-600 mb-6">No package information found. Please select a package first.</p>
        <Button onClick={() => navigate('/packages-list')} variant="info">
          Browse Packages
          </Button>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setReferralCode('');
    setAffiliateLink('');
    setTransactionId('');
    setPaymentScreenshot(null);
    setPreviewImage(null);
    setAcceptTerms(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        console.error('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        console.error('Please select an image file');
        return;
      }

      setPaymentScreenshot(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!transactionId.trim()) {
      console.error('Please enter your transaction ID.');
      setIsSubmitting(false);
      return;
    }

    if (!paymentScreenshot) {
      console.error('Please upload a payment screenshot.');
      setIsSubmitting(false);
      return;
    }

    if (!acceptTerms) {
      console.error('Please accept the terms and conditions to continue.');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        console.error('Please login to continue');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('courseId', courseId);
      

      let codeToSend = referralCode.trim();
      if (!codeToSend && affiliateLink.trim()) {
        try {
          const url = new URL(affiliateLink.trim());
          const refParam = url.searchParams.get('ref');
          if (refParam) codeToSend = refParam;
        } catch (_) {

        }
      }

      // Prevent users from using their own referral code
      if (codeToSend && userData?.affiliateCode && codeToSend === userData.affiliateCode) {
        console.error('You cannot use your own referral code for purchases.');
        setIsSubmitting(false);
        return;
      }
      formData.append('referralCode', codeToSend || '');
      formData.append('transactionId', transactionId.trim());
      formData.append('paymentScreenshot', paymentScreenshot);

      const response = await fetch(`${backendUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add course to cart');
      }

      console.log('Payment submitted successfully! Wait for admin validation.');
      setShowModal(true);
      resetForm();
    } catch (error) {
      console.error('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal handler
  const closeModal = () => {
    setShowModal(false);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
            <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">Secure payment for your package enrollment</p>
        </div>

        {/* Course Summary Card */}
        <Card className="mb-6">
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 bg-rose-100 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-base font-medium text-gray-900">Package Summary</h2>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-medium text-gray-900">{courseTitle}</h3>
            </div>
            <div className="sm:text-right">
              <div className="inline-flex items-center bg-rose-500 text-white px-3 py-2 rounded-lg">
                <span className="text-lg font-medium">{currency}{Math.round(coursePrice)}</span>
                <div className="ml-2 text-xs">
                  <div>Total Price</div>
            </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <h2 className="text-base font-medium text-gray-900 mb-4">Payment Instructions</h2>
            
            <div className="text-center mb-4">
              <div className="inline-block p-3 bg-gray-50 rounded-lg">
                <img src="/qr.jpg" alt="Payment QR Code" className="w-40 h-40 mx-auto rounded-lg shadow-sm" />
              </div>
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-base font-medium text-rose-700 mb-1">
                  Pay Exactly: {currency}{Math.round(coursePrice)}
                </p>
                <p className="text-xs text-rose-600">
                  Scan the QR code above to make payment
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-rose-800 mb-1">⚠️ Important Notes:</h3>
                <ul className="text-xs text-rose-700 space-y-1">
                  <li>• Pay the exact amount shown above</li>
                  <li>• Higher or lower amounts will not be accepted</li>
                  <li>• No refunds will be processed</li>
                  <li>• Keep your transaction receipt safe</li>
                </ul>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-rose-800 mb-1">📱 Payment Steps:</h3>
                <ol className="text-xs text-rose-700 space-y-1">
                  <li>1. Scan the QR code with your payment app</li>
                  <li>2. Enter the exact amount: {currency}{Math.round(coursePrice)}</li>
                  <li>3. Complete the payment</li>
                  <li>4. Take a screenshot of the confirmation</li>
                  <li>5. Fill the form and upload the screenshot</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Right Column: Payment Form */}
          <Card>
            <h2 className="text-base font-medium text-gray-900 mb-4">Payment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID from payment receipt"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Copy the transaction ID exactly as shown in your payment confirmation
                </p>
              </div>

              {/* Referral Section */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Affiliate Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={affiliateLink}
                    onChange={(e) => setAffiliateLink(e.target.value)}
                    placeholder="https://example.com/package/123?ref=ABCD1234"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="text-center text-gray-500 text-xs">OR</div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReferralCode(value);
                      
                      // Show warning if user tries to enter their own referral code
                      if (value.trim() && userData?.affiliateCode && value.trim() === userData.affiliateCode) {
                
                      }
                    }}
                    placeholder="Enter referral code (e.g., ABCD1234)"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition-colors ${
                      (referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                        ? 'border-red-300 focus:ring-red-500 bg-red-50'
                        : 'border-gray-300 focus:ring-rose-500'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${
                    (referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}>
                    {(referralCode.trim() && userData?.affiliateCode && referralCode.trim() === userData.affiliateCode)
                      ? '⚠️ You cannot use your own referral code'
                      : 'Use a referral code to get discounts or help your referrer earn commissions'
                    }
                  </p>
                </div>
              </div>

              {/* Payment Screenshot */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-rose-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                    required
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    {previewImage ? (
                      <div className="space-y-3">
                        <img
                          src={previewImage}
                          alt="Payment screenshot preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                        <p className="text-sm text-green-600 font-medium">Screenshot uploaded successfully!</p>
                        <p className="text-xs text-gray-500">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-4xl text-gray-400">📷</div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Upload payment screenshot</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="accept-terms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-3 w-3 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="accept-terms" className="text-xs text-gray-700">
                  I agree to the{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-800 underline"
                  >
                    Terms and Conditions
                  </a>
                  {' '}and{' '}
                  <a 
                    href="/policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-rose-600 hover:text-rose-800 underline"
                  >
                    Privacy Policy
                  </a>
                  . I understand that payments are non-refundable and package access will be activated after admin verification.
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={isSubmitting || !acceptTerms}
                variant="info"
                size="lg"
                fullWidth
              >
                Submit Payment Details
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        size="md"
        showCloseButton={false}
        closeOnOverlayClick={false}
      >
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-3">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Submitted!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment details have been submitted successfully. Our admin team will validate your payment within 24 hours.
          </p>
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-rose-800">
              <strong>What's next?</strong><br />
              You'll receive an email confirmation once your payment is verified and your package access is activated.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/packages-list')}
              variant="secondary"
              fullWidth
            >
              Browse More Packages
            </Button>
            <Button
              onClick={closeModal}
              variant="info"
              fullWidth
            >
              Go to Profile Dashboard
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default PaymentPage;