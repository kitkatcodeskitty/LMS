import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/users/Loading'
import { formatDate, formatDateTime } from '../../utils/formatters'
import { toast } from 'react-toastify'

const StudentEnrollment = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent') // recent, name, earnings
  const [viewMode, setViewMode] = useState('cards') // cards, detailed
  const [modalImage, setModalImage] = useState(null)
  const [expandedStudent, setExpandedStudent] = useState(null)

  // Popup control state
  const [editingUserId, setEditingUserId] = useState(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    affiliateEarnings: 0,
    affiliateCode: '',
    isAdmin: false,
    referredBy: '',
  })
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const fetchPurchasesWithUserData = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(`${backendUrl}/api/admin/enrolled-students`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!data.success) {
          toast.error('Failed to fetch purchases')
          setLoading(false)
          return
        }

        const studentsData = data.purchases // This is now grouped student data from backend

        // Fetch KYC data for each student
        const studentsWithKyc = await Promise.all(
          studentsData.map(async (studentData) => {
            try {
              const kycRes = await axios.get(
                `${backendUrl}/api/kyc/user/${studentData.userDetails._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              if (kycRes.data.success) {
                // Add KYC details to all purchases for this user
                studentData.purchases = studentData.purchases.map(purchase => ({
                  ...purchase,
                  kycDetails: kycRes.data.kyc
                }))
              }
            } catch (kycError) {
              // KYC data not found or error - that's okay
            }
            return studentData
          })
        )

        setPurchases(studentsWithKyc)
      } catch (error) {
        toast.error('Error fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchasesWithUserData()
  }, [backendUrl, getToken])

  // Filter and sort purchases
  const filteredAndSortedPurchases = purchases
    .filter(purchase => {
      if (!searchTerm) return true
      const user = purchase.userDetails
      const searchLower = searchTerm.toLowerCase()
      return (
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.userDetails.firstName} ${a.userDetails.lastName}`.localeCompare(
            `${b.userDetails.firstName} ${b.userDetails.lastName}`
          )
        case 'earnings':
          return (b.userDetails.affiliateEarnings || 0) - (a.userDetails.affiliateEarnings || 0)
        case 'spent':
          return b.totalSpent - a.totalSpent
        case 'courses':
          return b.totalCourses - a.totalCourses
        case 'recent':
        default:
          return new Date(b.lastPurchase) - new Date(a.lastPurchase)
      }
    })



  // Open popup & fill form
  const startEditing = (user) => {
    setEditingUserId(user._id)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Always empty for security
      affiliateEarnings: user.affiliateEarnings || 0,
      affiliateCode: user.affiliateCode || '',
      isAdmin: user.isAdmin || false,
      referredBy: user.referredBy || '',
    })
  }

  // Close popup
  const cancelEditing = () => {
    setEditingUserId(null)
  }

  // Handle input changes inside popup
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Save changes API call
  const saveUser = async () => {
    try {
      const token = await getToken()
      
      // Prepare form data - only include password if it's not empty
      const updateData = { ...editForm }
      if (!updateData.password.trim()) {
        delete updateData.password
      }
      
      const { data } = await axios.put(
        `${backendUrl}/api/user/update/${editingUserId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (data.success) {
        toast.success('User updated successfully')
        setPurchases((prev) =>
          prev.map((purchase) =>
            purchase.userDetails?._id === editingUserId
              ? { ...purchase, userDetails: data.data }
              : purchase
          )
        )
        setEditingUserId(null)
        setShowPassword(false)
      } else {
        toast.error(data.message || 'Failed to update user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error updating user')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen flex flex-col md:p-8 p-4 pt-8">
      <div className="w-full max-w-7xl">
        {/* Header with Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Students Enrolled</h2>
            <p className="text-gray-600 mt-1">{filteredAndSortedPurchases.length} students found</p>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recent Activity</option>
              <option value="name">Name A-Z</option>
              <option value="earnings">Affiliate Earnings</option>
              <option value="spent">Total Spent</option>
              <option value="courses">Courses Count</option>
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm ${viewMode === 'cards' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 text-sm ${viewMode === 'detailed' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>

        {filteredAndSortedPurchases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-lg mb-2">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedPurchases.map((studentData) => {
                  const user = studentData.userDetails
                  const kyc = studentData.purchases[0]?.kycDetails
                  
                  return (
                    <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                      {/* Header with Profile */}
                      <div className="p-4 sm:p-6 pb-4">
                        <div className="flex items-start gap-3 mb-4">
                          <div className="relative">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                              </div>
                            )}
                            {user.isAdmin && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">👑</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.affiliateCode && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                                  {user.affiliateCode}
                                </span>
                              )}
                              {kyc && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  kyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                                  kyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  kyc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  KYC: {kyc.status || 'Unknown'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{studentData.totalCourses}</div>
                            <div className="text-xs text-blue-600">Courses</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{currency}{studentData.totalSpent.toFixed(0)}</div>
                            <div className="text-xs text-green-600">Spent</div>
                          </div>
                        </div>

                        {/* Key Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Affiliate Earnings:</span>
                            <span className="font-medium text-green-600">
                              {currency}{(user.affiliateEarnings || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Referrals Made:</span>
                            <span className="font-medium text-orange-600">{studentData.referralCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Days Active:</span>
                            <span className="text-gray-900">
                              {Math.ceil((new Date() - new Date(studentData.firstPurchase)) / (1000 * 60 * 60 * 24))}
                            </span>
                          </div>
                        </div>

                        {/* KYC Information */}
                        {kyc && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">KYC Information</h4>
                            <div className="space-y-1 text-xs">
                              {kyc.fullName && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Full Name:</span>
                                  <span className="text-gray-900 truncate ml-2">{kyc.fullName}</span>
                                </div>
                              )}
                              {kyc.phoneNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Phone:</span>
                                  <span className="text-gray-900">{kyc.phoneNumber}</span>
                                </div>
                              )}
                              {kyc.dob && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">DOB:</span>
                                  <span className="text-gray-900">{kyc.dob}</span>
                                </div>
                              )}
                              {kyc.country && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Country:</span>
                                  <span className="text-gray-900">{kyc.country}</span>
                                </div>
                              )}
                              {kyc.city && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">City:</span>
                                  <span className="text-gray-900">{kyc.city}</span>
                                </div>
                              )}
                              {kyc.idType && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ID Type:</span>
                                  <span className="text-gray-900">{kyc.idType}</span>
                                </div>
                              )}
                              {kyc.idNumber && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ID Number:</span>
                                  <span className="text-gray-900 font-mono">{kyc.idNumber}</span>
                                </div>
                              )}
                              {(kyc.idFrontUrl || kyc.idBackUrl || kyc.selfieUrl) && (
                                <div className="pt-2 border-t border-gray-200">
                                  <span className="text-gray-600 text-xs">Documents:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {kyc.idFrontUrl && (
                                      <button
                                        onClick={() => setModalImage(kyc.idFrontUrl)}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        📄 Front
                                      </button>
                                    )}
                                    {kyc.idBackUrl && (
                                      <button
                                        onClick={() => setModalImage(kyc.idBackUrl)}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        📄 Back
                                      </button>
                                    )}
                                    {kyc.selfieUrl && (
                                      <button
                                        onClick={() => setModalImage(kyc.selfieUrl)}
                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                      >
                                        🤳 Selfie
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Recent Courses */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Courses:</h4>
                          <div className="space-y-1">
                            {studentData.purchases.slice(0, 2).map((purchase, index) => (
                              <div key={index} className="text-xs text-gray-600 truncate">
                                • {purchase.courseId?.courseTitle || 'Course Title Not Available'}
                              </div>
                            ))}
                            {studentData.purchases.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{studentData.purchases.length - 2} more courses
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Footer */}
                      <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(user)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            Edit Student
                          </button>
                          <button
                            onClick={() => setExpandedStudent(expandedStudent === user._id ? null : user._id)}
                            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Detailed View */}
            {viewMode === 'detailed' && (
              <div className="space-y-6">
                {filteredAndSortedPurchases.map((studentData) => {
                  const user = studentData.userDetails
                  const isExpanded = expandedStudent === user._id
                  
                  return (
                    <div key={user._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Student Header */}
                      <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="flex flex-col gap-4">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              {user.imageUrl ? (
                                <img
                                  src={user.imageUrl}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-gray-200"
                                />
                              ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg sm:text-xl">
                                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                              )}
                              {user.isAdmin && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">👑</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                                {user.firstName} {user.lastName}
                              </h3>
                              <p className="text-gray-600 break-all">{user.email}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
                                <span className="text-gray-500 text-xs">ID: {user._id.slice(-8)}</span>
                                {user.affiliateCode && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    Code: {user.affiliateCode}
                                  </span>
                                )}
                                {user.isAdmin && (
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    Admin
                                  </span>
                                )}
                                {studentData.purchases[0]?.kycDetails && (
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    studentData.purchases[0].kycDetails.status === 'verified' ? 'bg-green-100 text-green-800' :
                                    studentData.purchases[0].kycDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    studentData.purchases[0].kycDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    KYC: {studentData.purchases[0].kycDetails.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                              onClick={() => startEditing(user)}
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                              Edit Student
                            </button>
                            <button
                              onClick={() => setExpandedStudent(isExpanded ? null : user._id)}
                              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              {isExpanded ? 'Collapse' : 'Expand'} Details
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="p-4 sm:p-6 bg-gray-50">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-blue-600">{studentData.totalCourses}</div>
                            <div className="text-xs text-gray-600">Courses</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-green-600">{currency}{studentData.totalSpent.toFixed(0)}</div>
                            <div className="text-xs text-gray-600">Spent</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-purple-600">{currency}{(user.affiliateEarnings || 0).toFixed(0)}</div>
                            <div className="text-xs text-gray-600">Earnings</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-orange-600">{studentData.referralCount}</div>
                            <div className="text-xs text-gray-600">Referrals</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-indigo-600">{studentData.totalAffiliateEarned.toFixed(0)}</div>
                            <div className="text-xs text-gray-600">From Refs</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-xl sm:text-2xl font-bold text-teal-600">
                              {Math.ceil((new Date() - new Date(studentData.firstPurchase)) / (1000 * 60 * 60 * 24))}
                            </div>
                            <div className="text-xs text-gray-600">Days</div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-4 sm:p-6 space-y-6">
                          {/* Personal Information */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Full Name:</span>
                                <p className="text-gray-900 break-words">{user.firstName} {user.lastName}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Email:</span>
                                <p className="text-gray-900 break-all">{user.email}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">User ID:</span>
                                <p className="text-gray-900 font-mono text-xs break-all">{user._id}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Account Type:</span>
                                <p className="text-gray-900">{user.isAdmin ? 'Administrator' : 'Student'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Affiliate Code:</span>
                                <p className="text-gray-900">{user.affiliateCode || 'Not assigned'}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Referred By:</span>
                                <p className="text-gray-900">{user.referredBy || 'Direct signup'}</p>
                              </div>
                            </div>
                          </div>

                          {/* KYC Information */}
                          {studentData.purchases[0]?.kycDetails && (
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 mb-4">KYC Information</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                {/* KYC Status Header */}
                                <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h5 className="font-medium text-gray-900">Verification Status</h5>
                                      <p className="text-sm text-gray-600">
                                        {studentData.purchases[0].kycDetails.submittedAt && 
                                          `Submitted on ${formatDateTime(studentData.purchases[0].kycDetails.submittedAt)}`
                                        }
                                      </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      studentData.purchases[0].kycDetails.status === 'verified' ? 'bg-green-100 text-green-800' :
                                      studentData.purchases[0].kycDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      studentData.purchases[0].kycDetails.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {studentData.purchases[0].kycDetails.status === 'verified' ? '✅ Verified' :
                                       studentData.purchases[0].kycDetails.status === 'pending' ? '⏳ Pending' :
                                       studentData.purchases[0].kycDetails.status === 'rejected' ? '❌ Rejected' :
                                       '❓ Unknown'}
                                    </span>
                                  </div>
                                </div>

                                {/* Personal Information */}
                                <div className="mb-6">
                                  <h5 className="font-medium text-gray-900 mb-3">Personal Information</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {studentData.purchases[0].kycDetails.fullName && (
                                      <div>
                                        <span className="font-medium text-gray-700">Full Name:</span>
                                        <p className="text-gray-900 break-words">{studentData.purchases[0].kycDetails.fullName}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.dob && (
                                      <div>
                                        <span className="font-medium text-gray-700">Date of Birth:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.dob}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.gender && (
                                      <div>
                                        <span className="font-medium text-gray-700">Gender:</span>
                                        <p className="text-gray-900 capitalize">{studentData.purchases[0].kycDetails.gender}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.nationality && (
                                      <div>
                                        <span className="font-medium text-gray-700">Nationality:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.nationality}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.occupation && (
                                      <div>
                                        <span className="font-medium text-gray-700">Occupation:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.occupation}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.maritalStatus && (
                                      <div>
                                        <span className="font-medium text-gray-700">Marital Status:</span>
                                        <p className="text-gray-900 capitalize">{studentData.purchases[0].kycDetails.maritalStatus}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Contact Information */}
                                <div className="mb-6">
                                  <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {studentData.purchases[0].kycDetails.phoneNumber && (
                                      <div>
                                        <span className="font-medium text-gray-700">Phone Number:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.phoneNumber}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.alternatePhone && (
                                      <div>
                                        <span className="font-medium text-gray-700">Alternate Phone:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.alternatePhone}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.email && (
                                      <div>
                                        <span className="font-medium text-gray-700">Email:</span>
                                        <p className="text-gray-900 break-all">{studentData.purchases[0].kycDetails.email}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Address Information */}
                                <div className="mb-6">
                                  <h5 className="font-medium text-gray-900 mb-3">Address Information</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {studentData.purchases[0].kycDetails.addressLine1 && (
                                      <div className="sm:col-span-2 lg:col-span-3">
                                        <span className="font-medium text-gray-700">Street Address:</span>
                                        <p className="text-gray-900 break-words">{studentData.purchases[0].kycDetails.addressLine1}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.city && (
                                      <div>
                                        <span className="font-medium text-gray-700">City:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.city}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.state && (
                                      <div>
                                        <span className="font-medium text-gray-700">State/Province:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.state}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.postalCode && (
                                      <div>
                                        <span className="font-medium text-gray-700">Postal Code:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.postalCode}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.country && (
                                      <div>
                                        <span className="font-medium text-gray-700">Country:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.country}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Identity Document Information */}
                                <div className="mb-6">
                                  <h5 className="font-medium text-gray-900 mb-3">Identity Document</h5>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                    {studentData.purchases[0].kycDetails.idType && (
                                      <div>
                                        <span className="font-medium text-gray-700">Document Type:</span>
                                        <p className="text-gray-900 capitalize">{studentData.purchases[0].kycDetails.idType}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.idNumber && (
                                      <div>
                                        <span className="font-medium text-gray-700">Document Number:</span>
                                        <p className="text-gray-900 font-mono">{studentData.purchases[0].kycDetails.idNumber}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.documentIssueDate && (
                                      <div>
                                        <span className="font-medium text-gray-700">Issue Date:</span>
                                        <p className="text-gray-900">{formatDate(studentData.purchases[0].kycDetails.documentIssueDate)}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.documentExpiryDate && (
                                      <div>
                                        <span className="font-medium text-gray-700">Expiry Date:</span>
                                        <p className="text-gray-900">{formatDate(studentData.purchases[0].kycDetails.documentExpiryDate)}</p>
                                      </div>
                                    )}
                                    {studentData.purchases[0].kycDetails.documentIssuingAuthority && (
                                      <div className="sm:col-span-2">
                                        <span className="font-medium text-gray-700">Issuing Authority:</span>
                                        <p className="text-gray-900">{studentData.purchases[0].kycDetails.documentIssuingAuthority}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>



                                {/* KYC Documents */}
                                {(studentData.purchases[0].kycDetails.idFrontUrl || 
                                  studentData.purchases[0].kycDetails.idBackUrl || 
                                  studentData.purchases[0].kycDetails.selfieUrl) && (
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-3">Uploaded Documents</h5>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {studentData.purchases[0].kycDetails.idFrontUrl && (
                                        <button
                                          onClick={() => setModalImage(studentData.purchases[0].kycDetails.idFrontUrl)}
                                          className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                          <div className="text-2xl mb-1">📄</div>
                                          <span className="text-xs text-gray-700 text-center">ID Front</span>
                                        </button>
                                      )}
                                      {studentData.purchases[0].kycDetails.idBackUrl && (
                                        <button
                                          onClick={() => setModalImage(studentData.purchases[0].kycDetails.idBackUrl)}
                                          className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                          <div className="text-2xl mb-1">📄</div>
                                          <span className="text-xs text-gray-700 text-center">ID Back</span>
                                        </button>
                                      )}
                                      {studentData.purchases[0].kycDetails.selfieUrl && (
                                        <button
                                          onClick={() => setModalImage(studentData.purchases[0].kycDetails.selfieUrl)}
                                          className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                        >
                                          <div className="text-2xl mb-1">🤳</div>
                                          <span className="text-xs text-gray-700 text-center">Selfie</span>
                                        </button>
                                      )}

                                    </div>
                                  </div>
                                )}

                                {/* Admin Remarks */}
                                {studentData.purchases[0].kycDetails.remarks && (
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <h5 className="font-medium text-gray-900 mb-2">Admin Remarks</h5>
                                    <div className={`border rounded-lg p-3 ${
                                      studentData.purchases[0].kycDetails.status === 'rejected' 
                                        ? 'bg-red-50 border-red-200' 
                                        : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                      <p className={`text-sm ${
                                        studentData.purchases[0].kycDetails.status === 'rejected' 
                                          ? 'text-red-800' 
                                          : 'text-gray-800'
                                      }`}>
                                        {studentData.purchases[0].kycDetails.remarks}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Purchase History */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h4>
                            
                            {/* Mobile Card View */}
                            <div className="block sm:hidden space-y-4">
                              {studentData.purchases.map((purchase, index) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                  <div className="space-y-2">
                                    <div>
                                      <span className="font-medium text-gray-700">Course:</span>
                                      <p className="text-gray-900 text-sm">{purchase.courseId?.courseTitle || 'Course Not Available'}</p>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-700">Amount:</span>
                                      <span className="font-medium text-green-600">{currency}{(purchase.amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="font-medium text-gray-700">Date:</span>
                                      <span className="text-gray-900 text-sm">{formatDateTime(purchase.createdAt)}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Transaction ID:</span>
                                      <p className="text-gray-900 font-mono text-xs break-all">{purchase.transactionId || 'N/A'}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-700">Referral:</span>
                                      {purchase.referralCode ? (
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                          {purchase.referralCode}
                                        </span>
                                      ) : (
                                        <span className="text-gray-500 text-sm">None</span>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-medium text-gray-700">Status:</span>
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                        {purchase.status || 'Completed'}
                                      </span>
                                    </div>
                                    {purchase.paymentScreenshot && (
                                      <div className="pt-2 border-t border-gray-200">
                                        <button
                                          onClick={() => setModalImage(purchase.paymentScreenshot)}
                                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                        >
                                          📷 View Payment Screenshot
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                              <table className="min-w-full border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referral</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Screenshot</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {studentData.purchases.map((purchase, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-3 py-3 text-sm max-w-xs">
                                        <div className="font-medium text-gray-900 truncate" title={purchase.courseId?.courseTitle}>
                                          {purchase.courseId?.courseTitle || 'Course Not Available'}
                                        </div>
                                      </td>
                                      <td className="px-3 py-3 text-sm font-medium text-green-600">
                                        {currency}{(purchase.amount || 0).toFixed(2)}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-900">
                                        {formatDate(purchase.createdAt)}
                                      </td>
                                      <td className="px-3 py-3 text-sm text-gray-900 font-mono max-w-32">
                                        <div className="truncate" title={purchase.transactionId}>
                                          {purchase.transactionId || 'N/A'}
                                        </div>
                                      </td>
                                      <td className="px-3 py-3 text-sm">
                                        {purchase.referralCode ? (
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            {purchase.referralCode}
                                          </span>
                                        ) : (
                                          <span className="text-gray-500">None</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 text-sm">
                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                          {purchase.status || 'Completed'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-3 text-sm">
                                        {purchase.paymentScreenshot ? (
                                          <button
                                            onClick={() => setModalImage(purchase.paymentScreenshot)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                          >
                                            View
                                          </button>
                                        ) : (
                                          <span className="text-gray-500">None</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Activity Timeline */}
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="text-sm">
                                  <span className="font-medium">First Purchase:</span> {formatDateTime(studentData.firstPurchase)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="text-sm">
                                  <span className="font-medium">Latest Purchase:</span> {formatDateTime(studentData.lastPurchase)}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <div className="text-sm">
                                  <span className="font-medium">Total Learning Time:</span> 
                                  {Math.ceil((new Date(studentData.lastPurchase) - new Date(studentData.firstPurchase)) / (1000 * 60 * 60 * 24))} days
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUserId && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={cancelEditing}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Edit Student</h3>
                <button
                  onClick={cancelEditing}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={editForm.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave empty to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Leave empty to keep current password</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affiliate Code
                  </label>
                  <input
                    type="text"
                    name="affiliateCode"
                    value={editForm.affiliateCode}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Affiliate Code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Affiliate Earnings ({currency})
                  </label>
                  <input
                    type="number"
                    name="affiliateEarnings"
                    value={editForm.affiliateEarnings}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referred By
                  </label>
                  <input
                    type="text"
                    name="referredBy"
                    value={editForm.referredBy}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Referral code used by this user"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={editForm.isAdmin}
                    onChange={(e) => setEditForm(prev => ({ ...prev, isAdmin: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Admin Access
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={saveUser}
                    className="flex-1 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
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

      {/* Payment Screenshot Modal */}
      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 cursor-pointer"
        >
          <img
            src={modalImage}
            alt="Payment Screenshot"
            className="max-w-[90vw] max-h-[80vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default StudentEnrollment
