import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaUser, 
  FaIdCard, 
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt
} from 'react-icons/fa';

const KycDetails = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [kycData, setKycData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKycData();
  }, []);

  const fetchKycData = async () => {
    try {
      const token = getToken();
      if (!token) return;
      
      const { data } = await axios.get(`${backendUrl}/api/kyc/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success && data.kyc) {
        console.log('KYC Data received:', data.kyc);
        setKycData(data.kyc);
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading KYC details...</span>
      </div>
    );
  }

  if (!kycData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC Data Not Found</h3>
        <p className="text-gray-600">Unable to load your KYC verification details.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
             {/* Header */}
       <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
         <div className="flex items-center space-x-3 mb-4">
           <FaShieldAlt className="text-3xl sm:text-4xl" />
           <div>
             <h1 className="text-2xl sm:text-3xl font-bold">KYC Verification Complete</h1>
             <p className="text-pink-100">Your identity has been successfully verified</p>
           </div>
         </div>
         <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-full inline-block">
           <FaCheckCircle className="text-pink-200" />
           <span className="text-sm font-medium">Verified on {new Date(kycData.verifiedAt).toLocaleDateString()}</span>
         </div>
       </div>

             

       {/* KYC Details Cards */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                 {/* Personal Information */}
         <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
           <div className="flex items-center mb-4">
             <FaUser className="text-2xl text-pink-600 mr-3" />
             <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
           </div>
           
           
           
           <div className="space-y-3">
             <div className="flex justify-between items-center py-2 border-b border-gray-100">
               <span className="text-gray-600 font-medium">Full Name</span>
               <span className="text-gray-900 font-semibold">
                 {kycData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Not provided'}
               </span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-gray-100">
               <span className="text-gray-600 font-medium">Father's Name</span>
               <span className="text-gray-900 font-semibold">
                 {kycData.fatherName || 'Not provided'}
               </span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-gray-100">
               <span className="text-gray-600 font-medium">Grandfather's Name</span>
               <span className="text-gray-900 font-semibold">
                 {kycData.grandfatherName || 'Not provided'}
               </span>
             </div>
             <div className="flex justify-between items-center py-2">
               <span className="text-gray-600 font-medium">Age</span>
               <span className="text-gray-900 font-semibold">
                 {kycData.age ? `${kycData.age} years` : 'Not provided'}
               </span>
             </div>
           </div>
         </div>

                 {/* Contact Information */}
         <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
           <div className="flex items-center mb-4">
             <FaPhone className="text-2xl text-purple-600 mr-3" />
             <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
           </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 font-medium">Phone Number</span>
              <span className="text-gray-900 font-semibold">{kycData.phoneNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Email</span>
              <span className="text-gray-900 font-semibold">{userData.email}</span>
            </div>
          </div>
        </div>

                 {/* Address Information */}
         <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 lg:col-span-2">
           <div className="flex items-center mb-4">
             <FaMapMarkerAlt className="text-2xl text-pink-600 mr-3" />
             <h2 className="text-xl font-bold text-gray-900">Address Information</h2>
           </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 font-medium">
              {kycData.address || 'Address not provided'}
            </p>
          </div>
        </div>

                 {/* Document Information */}
         <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 lg:col-span-2">
           <div className="flex items-center mb-4">
             <FaIdCard className="text-2xl text-purple-600 mr-3" />
             <h2 className="text-xl font-bold text-gray-900">Document Information</h2>
           </div>
           
           
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-3">
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                 <span className="text-gray-600 font-medium">Document Type</span>
                 <span className="text-gray-900 font-semibold capitalize">
                   {kycData.documentType ? kycData.documentType.replace('_', ' ') : 'Not provided'}
                 </span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <span className="text-gray-600 font-medium">Document Number</span>
                 <span className="text-gray-900 font-semibold">
                   {kycData.documentNumber || 'Not provided'}
                 </span>
               </div>
             </div>
             <div className="space-y-3">
               <div className="flex justify-between items-center py-2 border-b border-gray-100">
                 <span className="text-gray-600 font-medium">Submitted On</span>
                 <span className="text-gray-900 font-semibold">{new Date(kycData.submittedAt).toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between items-center py-2">
                 <span className="text-gray-600 font-medium">Verified On</span>
                 <span className="text-gray-900 font-semibold">{new Date(kycData.verifiedAt).toLocaleDateString()}</span>
               </div>
             </div>
           </div>
         </div>

        {/* Document Images */}
        {kycData.idFrontUrl && (
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Document Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kycData.idFrontUrl && (
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ID Front</h4>
                  <img 
                    src={kycData.idFrontUrl} 
                    alt="ID Front" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              {kycData.idBackUrl && (
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">ID Back</h4>
                  <img 
                    src={kycData.idBackUrl} 
                    alt="ID Back" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
              {kycData.selfieUrl && (
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Selfie with ID</h4>
                  <img 
                    src={kycData.selfieUrl} 
                    alt="Selfie with ID" 
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

             {/* Status Information */}
       <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-pink-200">
         <div className="flex items-center space-x-3 mb-4">
           <FaCheckCircle className="text-3xl text-pink-600" />
           <div>
             <h3 className="text-xl font-bold text-pink-900">Verification Status</h3>
             <p className="text-pink-700">Your KYC has been successfully verified and approved</p>
           </div>
         </div>
         <div className="bg-white rounded-lg p-4 border border-pink-200">
           <div className="flex items-center justify-between">
             <span className="text-pink-800 font-medium">Status</span>
             <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
               ✓ Verified
             </span>
           </div>
           {kycData.remarks && (
             <div className="mt-3 pt-3 border-t border-pink-200">
               <span className="text-pink-800 font-medium">Admin Remarks:</span>
               <p className="text-pink-700 mt-1">{kycData.remarks}</p>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default KycDetails;
