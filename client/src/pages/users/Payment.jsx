import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'

const PaymentPage = () => {
  const location = useLocation()
  const { courseId, courseTitle, coursePrice, currency = '$' } = location.state || {}

  const [referralCode, setReferralCode] = useState('')

  if (!courseId || !courseTitle || coursePrice == null) {
    return (
      <div className="p-8 text-center text-red-600">
        No course data found. Please go back and select a course.
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          courseId,
          referralCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add course to cart')
      }

      toast.success('Course added to cart successfully! Wait for admin to Validate.')
    } catch (error) {
      toast.error('Error: ' + error.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Complete Your Payment</h2>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Column: QR Code */}
        <div className="flex justify-center lg:w-1/2">
          <img src="/qr.jpg" alt="Payment QR Code" className="w-48 h-48" />
        </div>

        {/* Right Column: Form */}
        <form onSubmit={handleSubmit} className="lg:w-1/2 space-y-4">
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

          <div>
            <label className="block mb-1 font-medium">Referral Code (optional)</label>
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code if you have one"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            <p className="text-sm mb-1 font-semibold">Please Note:</p>
            <ul className="list-disc list-inside text-sm">
              <li>Please scan the QR code above to complete your payment.</li>
              <li>After payment, your purchase will be verified by admin.</li>
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
  )
}

export default PaymentPage
