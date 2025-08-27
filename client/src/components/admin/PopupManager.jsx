import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const PopupManager = () => {
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
      console.error('Failed to fetch popups');
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
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
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
        console.log('Popup created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchPopups();
      }
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to create popup');
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
        console.log('Popup updated successfully');
        setShowEditModal(false);
        setEditingPopup(null);
        resetForm();
        fetchPopups();
      }
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to update popup');
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
        console.log('Popup deleted successfully');
        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to delete popup');
    }
  };

  const handleToggleStatus = async (popupId) => {
    try {
      const token = await getToken();
      const response = await axios.patch(`${backendUrl}/api/popups/${popupId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        console.log(response.data.message);
        fetchPopups();
      }
    } catch (error) {
      console.error('Failed to toggle popup status');
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Popup Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <img src={assets.add_icon} alt="Add" className="w-5 h-5" />
          Add New Popup
        </button>
      </div>

      {/* Popups List */}
      <div className="grid gap-4">
        {popups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No popups found. Create your first popup!
          </div>
        ) : (
          popups.map((popup) => (
            <div key={popup._id} className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img 
                  src={popup.imageUrl} 
                  alt={popup.title} 
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-lg">{popup.title}</h3>
                  <p className="text-sm text-gray-600">
                    Duration: {popup.displayDuration}ms | Priority: {popup.priority}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: 
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                      popup.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {popup.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(popup._id)}
                  className={`px-3 py-1 rounded text-sm ${
                    popup.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {popup.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => openEditModal(popup)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(popup._id)}
                  className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                  className="w-full border rounded-lg px-3 py-2"
                  required
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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

export default PopupManager;
