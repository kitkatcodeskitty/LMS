import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { 
  FaCheckCircle, 
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
      {/* Header - Always show this beautiful section */}
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
