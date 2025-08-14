import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const KycReview = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchList = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/kyc?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setList(data.kycs);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filter]);

  const action = async (id, type) => {
    try {
      const token = getToken();
      const url = `${backendUrl}/api/kyc/${id}/${type}`;
      const { data } = await axios.patch(url, { remarks: type === 'reject' ? 'Rejected by admin' : '' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(`KYC ${type}ed`);
        setList((prev) => prev.filter((k) => k._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Filter KYC records based on search term
  const filteredList = list.filter(kyc => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      kyc.user?.firstName?.toLowerCase().includes(searchLower) ||
      kyc.user?.lastName?.toLowerCase().includes(searchLower) ||
      kyc.user?.email?.toLowerCase().includes(searchLower) ||
      kyc.fullName?.toLowerCase().includes(searchLower) ||
      kyc.phoneNumber?.toLowerCase().includes(searchLower) ||
      kyc.country?.toLowerCase().includes(searchLower) ||
      kyc.idNumber?.toLowerCase().includes(searchLower) ||
      kyc.idType?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold">KYC Review</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredList.length} of {list.length} records shown
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Status Filter */}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)} 
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading KYC records...</p>
          </div>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No matching KYC records found' : `No ${filter} KYC records`}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search criteria' : `There are no ${filter} KYC submissions at the moment`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((k, idx) => (
            <div
              key={k._id}
              className="bg-white shadow-[0px_0px_15px_rgba(0,0,0,0.09)] p-6 space-y-3 relative overflow-hidden rounded"
            >
              <div className="w-24 h-24 bg-violet-500 rounded-full absolute -right-5 -top-7">
                <p className="absolute bottom-6 left-7 text-white text-2xl">
                  {String(idx + 1).padStart(2, '0')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Left: Profile */}
                <div className="flex flex-col items-center text-center">
                  <img
                    src={k.user?.imageUrl || '/placeholder-profile.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                  <h3 className="font-bold text-lg mt-3">
                    {k.user?.firstName} {k.user?.lastName}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-6 break-words">{k.user?.email}</p>
                </div>

                {/* Right: KYC Details */}
                <div>
                  <div className="text-sm text-zinc-600 space-y-1">
                    {k.fullName && (
                      <div>
                        <span className="text-gray-500">Full Name:</span> {k.fullName}
                      </div>
                    )}
                    {k.phoneNumber && (
                      <div>
                        <span className="text-gray-500">Phone:</span> {k.phoneNumber}
                      </div>
                    )}
                    {k.country && (
                      <div>
                        <span className="text-gray-500">Country:</span> {k.country}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">ID:</span> {k.idType} - {k.idNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span
                        className={
                          k.status === 'verified'
                            ? 'text-green-600'
                            : k.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }
                      >
                        {k.status}
                      </span>
                    </div>
                    {k.remarks && <div className="text-gray-600">Remarks: {k.remarks}</div>}
                  </div>

                  <div className="flex gap-3 pt-3">
                    {k.idFrontUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.idFrontUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Front
                      </a>
                    )}
                    {k.idBackUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.idBackUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Back
                      </a>
                    )}
                    {k.selfieUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.selfieUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Selfie
                      </a>
                    )}
                  </div>

                  {k.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => action(k._id, 'verify')}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => action(k._id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KycReview;


