 import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';

import { assets } from '../../assets/assets';
import Loading from '../../components/users/Loading';

const PopupManagement = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPopup, setEditingPopup] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    displayDuration: 4000,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    priority: 1
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${backendUrl}/api/popups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPopups(response.data.popups);
      }
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Keep original image quality - no compression
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Show file selected confirmation
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await getToken();
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(`${backendUrl}/api/popups`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {

        setShowCreateModal(false);
        resetForm();
        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to create popup:', error.response?.data?.message || error.message);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    
    try {
      const token = await getToken();
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.put(`${backendUrl}/api/popups/${editingPopup._id}`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {

        setShowEditModal(false);
        setEditingPopup(null);
        resetForm();
        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to update popup:', error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (popupId) => {
    if (!window.confirm('Are you sure you want to delete this popup?')) return;
    
    try {
      const token = await getToken();
      const response = await axios.delete(`${backendUrl}/api/popups/${popupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {

        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to delete popup:', error);
    }
  };

  const handleToggleStatus = async (popupId) => {
    try {
      const token = await getToken();
      const response = await axios.patch(`${backendUrl}/api/popups/${popupId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {

        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to toggle popup status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      image: null,
      displayDuration: 4000,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      priority: 1
    });
  };

  const openEditModal = (popup) => {
    setEditingPopup(popup);
    setFormData({
      title: popup.title,
      image: null,
      displayDuration: popup.displayDuration,
      startDate: new Date(popup.startDate).toISOString().split('T')[0],
      endDate: popup.endDate ? new Date(popup.endDate).toISOString().split('T')[0] : '',
      priority: popup.priority
    });
    setShowEditModal(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Popup Management</h1>
              <p className="text-gray-600 mt-2">Manage popups that appear on the home page</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <img src={assets.add_icon} alt="Add" className="w-5 h-5" />
              Create New Popup
            </button>
          </div>
        </div>

        {/* Popups Grid */}
        <div className="grid gap-6">
          {popups.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No popups yet</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first popup to engage visitors on the home page.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Popup
              </button>
            </div>
          ) : (
            popups.map((popup) => (
              <div key={popup._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex">
                  {/* Popup Image */}
                  <div className="w-48 h-32 flex-shrink-0">
                    <img 
                      src={popup.imageUrl} 
                      alt={popup.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Popup Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{popup.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Duration: {popup.displayDuration}ms</span>
                          <span>Priority: {popup.priority}</span>
                          <span>Created: {new Date(popup.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Start: {new Date(popup.startDate).toLocaleDateString()}</span>
                          {popup.endDate && (
                            <span>End: {new Date(popup.endDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          popup.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {popup.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(popup._id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          popup.isActive 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {popup.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => openEditModal(popup)}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(popup._id)}
                        className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Create New Popup</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Image</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                  className="w-full border rounded-lg px-3 py-2"
                />
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {uploadProgress}%</span>
                      <span>{isUploading ? 'Uploading...' : 'Processing...'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {formData.image && (
                  <div className="mt-2 text-sm text-green-600">
                    ✓ Image selected: {formData.image.name}
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Display Duration (ms)</label>
                <input
                  type="number"
                  name="displayDuration"
                  value={formData.displayDuration}
                  onChange={handleInputChange}
                  min="1000"
                  max="10000"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Edit Popup</h3>
            <form onSubmit={handleEdit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Image (Leave empty to keep current)</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Display Duration (ms)</label>
                <input
                  type="number"
                  name="displayDuration"
                  value={formData.displayDuration}
                  onChange={handleInputChange}
                  min="1000"
                  max="10000"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Priority</label>
                <input
                  type="number"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPopup(null);
                    resetForm();
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupManagement;
