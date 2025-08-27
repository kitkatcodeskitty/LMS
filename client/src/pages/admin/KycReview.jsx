import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
const KycReview = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKyc, setEditingKyc] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [uploading, setUploading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/kyc?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setList(data.kycs);
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
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
        console.log(`KYC ${type}ed`);
        setList((prev) => prev.filter((k) => k._id !== id));
      }
    } catch (error) {
      console.error(error.response?.data?.message || error.message);
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
      kyc.name?.toLowerCase().includes(searchLower) ||
      kyc.fatherName?.toLowerCase().includes(searchLower) ||
      kyc.grandfatherName?.toLowerCase().includes(searchLower) ||
      kyc.phoneNumber?.toLowerCase().includes(searchLower) ||
      kyc.address?.toLowerCase().includes(searchLower) ||
      kyc.documentNumber?.toLowerCase().includes(searchLower) ||
      kyc.documentType?.toLowerCase().includes(searchLower)
    );
  });

  const startEditing = (kyc) => {
    setEditingKyc(kyc);
    setEditForm({
      name: kyc.name || '',
      fatherName: kyc.fatherName || '',
      grandfatherName: kyc.grandfatherName || '',
      age: kyc.age || '',
      phoneNumber: kyc.phoneNumber || '',
      address: kyc.address || '',
      documentType: kyc.documentType || '',
      documentNumber: kyc.documentNumber || '',
      status: kyc.status || 'pending',
      remarks: kyc.remarks || ''
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that editingKyc exists and has an _id
    if (!editingKyc || !editingKyc._id) {
      console.error('KYC data is invalid. Please try editing again.');
      return;
    }
    
    setUploading(true);

    try {
      const token = getToken();
      const formData = new FormData();

      // Add all form fields
      Object.keys(editForm).forEach(key => {
        if (editForm[key]) {
          formData.append(key, editForm[key]);
        }
      });

      // Add files if selected
      const idFrontFile = document.getElementById('editIdFront')?.files[0];
      const idBackFile = document.getElementById('editIdBack')?.files[0];
      const selfieFile = document.getElementById('editSelfie')?.files[0];

      if (idFrontFile) formData.append('idFront', idFrontFile);
      if (idBackFile) formData.append('idBack', idBackFile);
      if (selfieFile) formData.append('selfie', selfieFile);



      const { data } = await axios.put(
        `${backendUrl}/api/kyc/${editingKyc._id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (data.success) {
        console.log('KYC updated successfully');
        setEditingKyc(null);
        fetchList(); // Refresh the list
      } else {
        console.error(data.message || 'Failed to update KYC');
      }
    } catch (error) {
      console.error('KYC Update Error:', error);
      if (error.response?.status === 404) {
        console.error('KYC not found. Please refresh the page and try again.');
      } else if (error.response?.status === 500) {
        console.error('Server error occurred. Please try again later.');
      } else {
        console.error(error.response?.data?.message || error.message || 'Error updating KYC');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

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
              placeholder="Search by name, father name, phone, address..."
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
                    {k.name && (
                      <div>
                        <span className="text-gray-500">Name:</span> {k.name}
                      </div>
                    )}
                    {k.fatherName && (
                      <div>
                        <span className="text-gray-500">Father's Name:</span> {k.fatherName}
                      </div>
                    )}
                    {k.grandfatherName && (
                      <div>
                        <span className="text-gray-500">Grandfather's Name:</span> {k.grandfatherName}
                      </div>
                    )}
                    {k.age && (
                      <div>
                        <span className="text-gray-500">Age:</span> {k.age}
                      </div>
                    )}
                    {k.phoneNumber && (
                      <div>
                        <span className="text-gray-500">Phone:</span> {k.phoneNumber}
                      </div>
                    )}
                    {k.address && (
                      <div>
                        <span className="text-gray-500">Address:</span> {k.address}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Document:</span> {k.documentType} - {k.documentNumber}
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

                  <div className="flex gap-2 pt-4 flex-wrap">
                    <button
                      onClick={() => startEditing(k)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    {k.status === 'pending' && (
                      <>
                        <button
                          onClick={() => action(k._id, 'verify')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => action(k._id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit KYC Modal */}
      {editingKyc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit KYC - {editingKyc.user?.firstName} {editingKyc.user?.lastName}
                </h2>
                <button
                  onClick={() => setEditingKyc(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={editForm.fatherName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Grandfather's Name</label>
                      <input
                        type="text"
                        name="grandfatherName"
                        value={editForm.grandfatherName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={editForm.age}
                        onChange={handleInputChange}
                        min="1"
                        max="120"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={editForm.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                      <textarea
                        name="address"
                        value={editForm.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter complete address including city, state, country..."
                      />
                    </div>
                  </div>
                </div>

                {/* Document Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                      <select
                        name="documentType"
                        value={editForm.documentType}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Document Type</option>
                        <option value="citizenship">Citizenship</option>
                        <option value="passport">Passport</option>
                        <option value="driving_license">Driving License</option>
                        <option value="voter_id">Voter ID</option>
                        <option value="national_id">National ID</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Document Number</label>
                      <input
                        type="text"
                        name="documentNumber"
                        value={editForm.documentNumber}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter document number"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Upload */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Documents (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Front</label>
                      <input
                        type="file"
                        id="editIdFront"
                        accept="image/*"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editingKyc.idFrontUrl && (
                        <a href={editingKyc.idFrontUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                          View Current
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID Back</label>
                      <input
                        type="file"
                        id="editIdBack"
                        accept="image/*"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editingKyc.idBackUrl && (
                        <a href={editingKyc.idBackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                          View Current
                        </a>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Selfie</label>
                      <input
                        type="file"
                        id="editSelfie"
                        accept="image/*"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {editingKyc.selfieUrl && (
                        <a href={editingKyc.selfieUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline">
                          View Current
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Remarks */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Remarks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                      <textarea
                        name="remarks"
                        value={editForm.remarks}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add remarks or notes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingKyc(null)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                      uploading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {uploading ? 'Updating...' : 'Update KYC'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycReview;


