import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import Footer from '../../components/users/Footer';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaClock, 
  FaTimesCircle, 
  FaUpload, 
  FaUser, 
  FaIdCard, 
  FaCamera,
  FaShieldAlt,
  FaInfoCircle
} from 'react-icons/fa';

const Kyc = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [myKyc, setMyKyc] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    gender: '',
    nationality: '',
    occupation: '',
    maritalStatus: '',
    addressLine1: '',
    phoneNumber: '',
    alternatePhone: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    idType: 'national_id',
    idNumber: '',
    documentIssueDate: '',
    documentExpiryDate: '',
    documentIssuingAuthority: '',
  });
  const [files, setFiles] = useState({ idFront: null, idBack: null, selfie: null });
  const [filePreviews, setFilePreviews] = useState({ idFront: null, idBack: null, selfie: null });

  const fetchMyKyc = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const { data } = await axios.get(`${backendUrl}/api/kyc/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setMyKyc(data.kyc);
        // Pre-fill form if KYC exists
        if (data.kyc) {
          setForm({
            fullName: data.kyc.fullName || '',
            dob: data.kyc.dob || '',
            gender: data.kyc.gender || '',
            nationality: data.kyc.nationality || '',
            occupation: data.kyc.occupation || '',
            maritalStatus: data.kyc.maritalStatus || '',
            addressLine1: data.kyc.addressLine1 || '',
            phoneNumber: data.kyc.phoneNumber || '',
            alternatePhone: data.kyc.alternatePhone || '',
            city: data.kyc.city || '',
            state: data.kyc.state || '',
            postalCode: data.kyc.postalCode || '',
            country: data.kyc.country || '',
            idType: data.kyc.idType || 'national_id',
            idNumber: data.kyc.idNumber || '',
            documentIssueDate: data.kyc.documentIssueDate || '',
            documentExpiryDate: data.kyc.documentExpiryDate || '',
            documentIssuingAuthority: data.kyc.documentIssuingAuthority || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching KYC:', error);
    }
  };

  useEffect(() => {
    fetchMyKyc();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.idNumber.trim()) newErrors.idNumber = 'ID number is required';
    
    // Phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Date validation (must be at least 18 years old)
    if (form.dob) {
      const today = new Date();
      const birthDate = new Date(form.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const onFile = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload only image files');
        return;
      }
      
      setFiles({ ...files, [name]: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviews({ ...filePreviews, [name]: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (files.idFront) body.append('idFront', files.idFront);
      if (files.idBack) body.append('idBack', files.idBack);
      if (files.selfie) body.append('selfie', files.selfie);

      const { data } = await axios.post(`${backendUrl}/api/kyc/submit`, body, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (data.success) {
        toast.success('KYC submitted successfully! We will review your application within 24-48 hours.');
        setMyKyc(data.kyc);
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred while submitting KYC');
    } finally {
      setLoading(false);
    }
  };

  const status = myKyc?.status || userData?.kycStatus || 'unsubmitted';

  const getStatusConfig = (status) => {
    switch (status) {
      case 'verified':
        return {
          icon: FaCheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Verified',
          description: 'Your identity has been successfully verified!'
        };
      case 'pending':
        return {
          icon: FaClock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Under Review',
          description: 'Your KYC application is being reviewed. This usually takes 24-48 hours.'
        };
      case 'rejected':
        return {
          icon: FaTimesCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Rejected',
          description: 'Your KYC application was rejected. Please review the remarks and resubmit.'
        };
      default:
        return {
          icon: FaExclamationTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Not Submitted',
          description: 'Please complete your KYC verification to access all features.'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex items-center justify-center mb-4">
              <FaShieldAlt className="text-4xl text-rose-600 mr-3 animate-pulse" />
              <h1 className="text-3xl font-bold text-gray-900">KYC Verification</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Complete your Know Your Customer (KYC) verification to unlock all platform features and ensure account security.
            </p>
          </div>

          {/* Status Card */}
          <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-6 mb-8 animate-fade-in-up animation-delay-300`}>
            <div className="flex items-start space-x-4">
              <StatusIcon className={`text-2xl ${statusConfig.color} mt-1`} />
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${statusConfig.color} mb-2`}>
                  {statusConfig.title}
                </h3>
                <p className="text-gray-700 mb-3">{statusConfig.description}</p>
                {myKyc?.remarks && (
                  <div className="bg-white/50 rounded-lg p-3 mt-3">
                    <p className="text-sm font-medium text-gray-800 mb-1">Admin Remarks:</p>
                    <p className="text-sm text-gray-600">{myKyc.remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KYC Form */}
          {(status === 'unsubmitted' || status === 'rejected') && (
            <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in-up animation-delay-400 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <FaUser className="text-2xl text-rose-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up animation-delay-500">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={onChange}
                      placeholder="Enter your full legal name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={onChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.dob ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <input
                      name="nationality"
                      value={form.nationality}
                      onChange={onChange}
                      placeholder="Enter your nationality"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupation
                    </label>
                    <input
                      name="occupation"
                      value={form.occupation}
                      onChange={onChange}
                      placeholder="Enter your occupation"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marital Status
                    </label>
                    <select
                      name="maritalStatus"
                      value={form.maritalStatus}
                      onChange={onChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={onChange}
                      placeholder="+1 234 567 8900"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alternate Phone
                    </label>
                    <input
                      name="alternatePhone"
                      value={form.alternatePhone}
                      onChange={onChange}
                      placeholder="+1 234 567 8900 (optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={onChange}
                      placeholder="Street address, P.O. box, company name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={onChange}
                      placeholder="Enter your city"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={onChange}
                      placeholder="Enter your state or province"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code *
                    </label>
                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={onChange}
                      placeholder="Enter postal/ZIP code"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={onChange}
                      placeholder="Enter your country"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                </div>

                {/* ID Information */}
                <div className="border-t pt-6 animate-fade-in-up animation-delay-600">
                  <div className="flex items-center mb-6">
                    <FaIdCard className="text-2xl text-rose-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Identity Verification</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Type *
                      </label>
                      <select
                        name="idType"
                        value={form.idType}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                      >
                        <option value="passport">Passport</option>
                        <option value="national_id">National ID</option>
                        <option value="driving_license">Driving License</option>
                        <option value="voter_id">Voter ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID Number *
                      </label>
                      <input
                        name="idNumber"
                        value={form.idNumber}
                        onChange={onChange}
                        placeholder="Enter your ID number"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                          errors.idNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.idNumber && <p className="text-red-500 text-sm mt-1">{errors.idNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Issue Date
                      </label>
                      <input
                        name="documentIssueDate"
                        type="date"
                        value={form.documentIssueDate}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Expiry Date
                      </label>
                      <input
                        name="documentExpiryDate"
                        type="date"
                        value={form.documentExpiryDate}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Issuing Authority
                      </label>
                      <input
                        name="documentIssuingAuthority"
                        value={form.documentIssuingAuthority}
                        onChange={onChange}
                        placeholder="Enter the authority that issued your document"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* File Uploads */}
                <div className="border-t pt-6 animate-fade-in-up animation-delay-700">
                  <div className="flex items-center mb-6">
                    <FaCamera className="text-2xl text-rose-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Document Upload</h3>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <FaInfoCircle className="text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Upload Requirements</h4>
                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                          <li>• Images must be clear and readable</li>
                          <li>• Maximum file size: 5MB per image</li>
                          <li>• Accepted formats: JPG, PNG, GIF</li>
                          <li>• Ensure all corners of the document are visible</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: 'idFront', label: 'ID Front Side', icon: FaIdCard },
                      { name: 'idBack', label: 'ID Back Side', icon: FaIdCard },
                      { name: 'selfie', label: 'Selfie with ID', icon: FaCamera }
                    ].map(({ name, label, icon: Icon }) => (
                      <div key={name} className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {label}
                        </label>
                        <div className="relative">
                          <input
                            name={name}
                            type="file"
                            accept="image/*"
                            onChange={onFile}
                            className="hidden"
                            id={name}
                          />
                          <label
                            htmlFor={name}
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            {filePreviews[name] ? (
                              <img
                                src={filePreviews[name]}
                                alt={label}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="flex flex-col items-center">
                                <Icon className="text-2xl text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">Click to upload</span>
                              </div>
                            )}
                          </label>
                        </div>
                        {files[name] && (
                          <p className="text-xs text-green-600">✓ {files[name].name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t pt-6 animate-fade-in-up animation-delay-800">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 hover:scale-105 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting KYC...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FaUpload />
                        <span>Submit KYC Verification</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Already Submitted Message */}
          {(status === 'pending' || status === 'verified') && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center animate-fade-in-up animation-delay-400 hover:shadow-xl transition-all duration-300">
              <StatusIcon className={`text-6xl ${statusConfig.color} mx-auto mb-4`} />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">KYC {statusConfig.title}</h3>
              <p className="text-gray-600 mb-6">{statusConfig.description}</p>
              {status === 'verified' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    🎉 Congratulations! You now have access to all platform features.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Kyc;