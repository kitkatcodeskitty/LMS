import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
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
    name: '',
    fatherName: '',
    grandfatherName: '',
    age: '',
    phoneNumber: '',
    address: '',
    documentType: 'citizenship',
    documentNumber: '',
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
            name: data.kyc.name || '',
            fatherName: data.kyc.fatherName || '',
            grandfatherName: data.kyc.grandfatherName || '',
            age: data.kyc.age || '',
            phoneNumber: data.kyc.phoneNumber || '',
            address: data.kyc.address || '',
            documentType: data.kyc.documentType || 'citizenship',
            documentNumber: data.kyc.documentNumber || '',
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
    
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.fatherName.trim()) newErrors.fatherName = 'Father\'s name is required';
    if (!form.grandfatherName.trim()) newErrors.grandfatherName = 'Grandfather\'s name is required';
    if (!form.age) newErrors.age = 'Age is required';
    if (!form.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.documentNumber.trim()) newErrors.documentNumber = 'Document number is required';
    
    // Phone number validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (form.phoneNumber && !phoneRegex.test(form.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    // Age validation (must be at least 18 years old)
    if (form.age) {
      const age = parseInt(form.age, 10);
      if (age < 18) {
        newErrors.age = 'You must be at least 18 years old';
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
        console.error('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('Please upload only image files');
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
      console.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('Please login first');
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
        console.log('KYC submitted successfully! We will review your application within 24-48 hours.');
        setMyKyc(data.kyc);
      } else {
        console.error(data.message || 'Submission failed');
      }
    } catch (error) {
      console.error(error.response?.data?.message || 'An error occurred while submitting KYC');
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
                      Name *
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      placeholder="e.g., Ram Bahadur Thapa"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Father's Name *
                    </label>
                    <input
                      name="fatherName"
                      value={form.fatherName}
                      onChange={onChange}
                      placeholder="e.g., Laxman Thapa"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.fatherName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.fatherName && <p className="text-red-500 text-sm mt-1">{errors.fatherName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grandfather's Name *
                    </label>
                    <input
                      name="grandfatherName"
                      value={form.grandfatherName}
                      onChange={onChange}
                      placeholder="e.g., Shiva Thapa"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.grandfatherName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.grandfatherName && <p className="text-red-500 text-sm mt-1">{errors.grandfatherName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      name="age"
                      type="number"
                      value={form.age}
                      onChange={onChange}
                      placeholder="e.g., 25"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      name="phoneNumber"
                      value={form.phoneNumber}
                      onChange={onChange}
                      placeholder="e.g., 9841234567 or +977-984-123-4567"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: 10-digit number (e.g., 9841234567) or international format (+977-984-123-4567)</p>
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address *
                    </label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="e.g., Ward No. 5, Thamel, Kathmandu, Nepal"
                      rows="3"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                        errors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
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
                        Document Type *
                      </label>
                      <select
                        name="documentType"
                        value={form.documentType}
                        onChange={onChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                      >
                        <option value="citizenship">Citizenship</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                        <option value="voter_id">Voter ID</option>
                        <option value="national_id">National ID</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Number *
                      </label>
                      <input
                        name="documentNumber"
                        value={form.documentNumber}
                        onChange={onChange}
                        placeholder="e.g., 1234567890 or 01-01-123456-01"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                          errors.documentNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.documentNumber && <p className="text-red-500 text-sm mt-1">{errors.documentNumber}</p>}
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