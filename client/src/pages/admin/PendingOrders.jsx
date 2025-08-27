import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import { formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'

const PendingOrders = () => {
  const { backendUrl, getToken, fetchPendingOrdersCount } = useContext(AppContext)
  const [pendingOrders, setPendingOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingOrder, setEditingOrder] = useState(null)
  const [editForm, setEditForm] = useState({
    transactionId: '',
    referralCode: '',
    paymentScreenshot: null
  })

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const fetchPendingOrders = async () => {
    try {
      const token = getToken()
      const { data } = await axios.get(`${backendUrl}/api/cart/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setPendingOrders(data.pendingOrders)
      } else {
        console.error('Failed to fetch pending orders')
      }
    } catch (error) {
      console.error('Error fetching pending orders')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (order) => {
    try {
      const token = getToken()
      const { data } = await axios.put(
        `${backendUrl}/api/cart/validate`,
        {
          userId: order.user._id,
          courseId: order.course._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (data.success) {
        console.log('Order accepted successfully!')
        fetchPendingOrders() // Refresh the list
        fetchPendingOrdersCount() // Update the count in sidebar
      } else {
        console.error('Failed to accept order')
      }
    } catch (error) {
      console.error('Error accepting order')
      console.error(error)
    }
  }

  const handleReject = async (order) => {
    if (!window.confirm('Are you sure you want to reject this order?')) {
      return
    }

    try {
      const token = getToken()
      const { data } = await axios.delete(`${backendUrl}/api/cart/reject`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
          userId: order.user._id,
          courseId: order.course._id
        }
      })

      if (data.success) {
        console.log('Order rejected successfully!')
        fetchPendingOrders() // Refresh the list
        fetchPendingOrdersCount() // Update the count in sidebar
      } else {
        console.error('Failed to reject order')
      }
    } catch (error) {
      console.error('Error rejecting order')
      console.error(error)
    }
  }

  const startEditing = (order) => {
    setEditingOrder(order)
    setEditForm({
      transactionId: order.transactionId || '',
      referralCode: order.referralCode || '',
      paymentScreenshot: null
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = getToken()
      const formData = new FormData()

      formData.append('userId', editingOrder.user._id)
      formData.append('courseId', editingOrder.course._id)
      formData.append('transactionId', editForm.transactionId)
      formData.append('referralCode', editForm.referralCode)

      if (editForm.paymentScreenshot) {
        formData.append('paymentScreenshot', editForm.paymentScreenshot)
      }

      const { data } = await axios.put(
        `${backendUrl}/api/cart/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      if (data.success) {
        console.log('Order updated successfully!')
        setEditingOrder(null)
        fetchPendingOrders() // Refresh the list
        fetchPendingOrdersCount() // Update the count in sidebar
      } else {
        console.error(data.message || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order')
      console.error(error)
    }
  }



  // Filter orders based on search term
  const filteredOrders = pendingOrders.filter(order => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      order.user.firstName.toLowerCase().includes(searchLower) ||
      order.user.lastName.toLowerCase().includes(searchLower) ||
      order.user.email.toLowerCase().includes(searchLower) ||
      order.course.courseTitle.toLowerCase().includes(searchLower) ||
      order.transactionId.toLowerCase().includes(searchLower) ||
      (order.referralCode && order.referralCode.toLowerCase().includes(searchLower))
    )
  })

  if (loading) return <LoadingSpinner fullScreen text="Loading pending orders..." />

  return (
    <div className="min-h-screen flex flex-col md:p-8 p-4 pt-8">
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Course Orders
            </h2>
            <div className="text-sm text-gray-500 mt-1">
              {filteredOrders.length} of {pendingOrders.length} orders shown
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by student, course, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <Card className="text-center" padding="lg">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching orders found' : 'No pending orders'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'All orders have been processed successfully'}
            </p>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="w-56 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral
                      </th>
                      <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Screenshot
                      </th>
                      <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="max-w-48">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {order.user.firstName} {order.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 truncate">{order.user.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900 max-w-56 truncate" title={order.course.courseTitle}>
                            {order.course.courseTitle}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          Rs {order.course.coursePrice}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="max-w-32 truncate" title={order.transactionId}>
                            {order.transactionId}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="max-w-24 truncate">
                            {order.referralCode || 'None'}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          <div className="max-w-28">
                            {new Date(order.addedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {order.paymentScreenshot && (
                            <a
                              href={order.paymentScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-col space-y-1">
                            <button
                              onClick={() => startEditing(order)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleAccept(order)}
                                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition-colors flex-1"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleReject(order)}
                                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors flex-1"
                              >
                                ✗
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet Table View */}
            <div className="hidden lg:block xl:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student & Course
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction Details
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user.firstName} {order.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500 mb-1">{order.user.email}</div>
                            <div className="text-sm font-medium text-gray-700 truncate max-w-xs" title={order.course.courseTitle}>
                              {order.course.courseTitle}
                            </div>
                            <div className="text-sm text-gray-500">Rs {order.course.coursePrice}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm">
                            <div className="mb-1">
                              <span className="font-medium">TX:</span> {order.transactionId}
                            </div>
                            <div className="mb-1">
                              <span className="font-medium">Ref:</span> {order.referralCode || 'None'}
                            </div>
                            <div className="mb-1">
                              <span className="font-medium">Date:</span> {formatDateTime(order.addedAt)}
                            </div>
                            {order.paymentScreenshot && (
                              <a
                                href={order.paymentScreenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline text-xs"
                              >
                                View Screenshot
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => startEditing(order)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              Edit
                            </button>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleAccept(order)}
                                className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex-1"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleReject(order)}
                                className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors flex-1"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
              {filteredOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex flex-col space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.user.firstName} {order.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{order.user.email}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>

                    {/* Course Info */}
                    <div className="border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Course:</span>
                          <p className="text-gray-900 mt-1">{order.course.courseTitle}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Price:</span>
                          <p className="text-gray-900 mt-1">Rs {order.course.coursePrice}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Transaction ID:</span>
                          <p className="text-gray-900 mt-1 break-all">{order.transactionId}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Referral:</span>
                          <p className="text-gray-900 mt-1">{order.referralCode || 'None'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <p className="text-gray-900 mt-1">{formatDateTime(order.addedAt)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Payment:</span>
                          {order.paymentScreenshot ? (
                            <a
                              href={order.paymentScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline mt-1 block"
                            >
                              View Screenshot
                            </a>
                          ) : (
                            <p className="text-gray-500 mt-1">No screenshot</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => startEditing(order)}
                          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Edit Order
                        </button>
                        <button
                          onClick={() => handleAccept(order)}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(order)}
                          className="flex-1 bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Order</h3>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Student:</span>
                    <p className="text-sm text-gray-900">
                      {editingOrder.user.firstName} {editingOrder.user.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Course:</span>
                    <p className="text-sm text-gray-900">{editingOrder.course.courseTitle}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Price:</span>
                    <p className="text-sm text-gray-900">Rs {editingOrder.course.coursePrice}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={editForm.transactionId}
                    onChange={(e) => setEditForm({ ...editForm, transactionId: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter transaction ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={editForm.referralCode}
                    onChange={(e) => setEditForm({ ...editForm, referralCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter referral code (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditForm({ ...editForm, paymentScreenshot: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current screenshot</p>
                  {editingOrder.paymentScreenshot && (
                    <div className="mt-2">
                      <a
                        href={editingOrder.paymentScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm inline-flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Current Screenshot
                      </a>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingOrders