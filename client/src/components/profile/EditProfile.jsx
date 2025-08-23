import React, { useState } from 'react';

const EditProfile = ({ 
  userData, 
  editForm, 
  setEditForm, 
  handleEditProfile, 
  setActiveTab
}) => {
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreviewImage, setProfilePreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setProfileImageFile(file);
      
      // Update parent editForm
      setEditForm(prev => ({ ...prev, profileImageFile: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImageFile(null);
    setProfilePreviewImage(null);
    // Update parent editForm
    setEditForm(prev => ({ ...prev, profileImageFile: null }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const updatedPasswordData = { ...passwordData, [name]: value };
    setPasswordData(updatedPasswordData);
    
    // Update parent editForm with password data
    setEditForm(prev => ({ ...prev, passwordData: updatedPasswordData }));
  };

  const togglePasswordFields = () => {
    setShowPasswordFields(!showPasswordFields);
    if (!showPasswordFields) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const validatePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New password and confirm password do not match');
      return false;
    }
    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Profile</h2>
        <div className="mt-2 sm:mt-0">
          <span className="text-sm text-gray-500">Update your personal information</span>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <form onSubmit={handleEditProfile} className="space-y-4 sm:space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-4 sm:pb-6 border-b border-gray-200 animate-fade-in-up animation-delay-200">
            <div className="relative">
              <img
                src={profilePreviewImage || userData.imageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-rose-200 mx-auto sm:mx-0 hover:scale-105 transition-transform duration-300"
              />
              {profilePreviewImage && (
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                  id="profile-image-input"
                />
                <label
                  htmlFor="profile-image-input"
                  className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 hover:scale-105 transition-all duration-300 text-sm font-medium transform cursor-pointer inline-block"
                >
                  {profileImageFile ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">JPG, PNG up to 5MB</p>
              {profileImageFile && (
                <p className="text-xs text-green-600 font-medium">
                  ✓ Photo selected: {profileImageFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in-up animation-delay-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base hover:border-rose-300 transition-colors duration-200"
                  placeholder="Enter your first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base hover:border-rose-300 transition-colors duration-200"
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base hover:border-rose-300 transition-colors duration-200"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password Update Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
                <button
                  type="button"
                  onClick={togglePasswordFields}
                  className="text-rose-600 hover:text-rose-700 text-sm font-medium transition-colors"
                >
                  {showPasswordFields ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordFields && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm hover:border-rose-300 transition-colors duration-200"
                      placeholder="Enter your current password"
                      required={showPasswordFields}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm hover:border-rose-300 transition-colors duration-200"
                        placeholder="Enter new password"
                        required={showPasswordFields}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 sm:px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm hover:border-rose-300 transition-colors duration-200"
                        placeholder="Confirm new password"
                        required={showPasswordFields}
                      />
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600">
                    <p>• Password must be at least 6 characters long</p>
                    <p>• Make sure your new password is different from your current one</p>
                  </div>
                </div>
              )}
            </div>


          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200 animate-fade-in-up animation-delay-400">
            <button
              type="submit"
              className="w-full sm:w-auto bg-rose-500 text-white px-6 py-3 rounded-lg hover:bg-rose-600 hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base transform"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base transform"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>


    </div>
  );
};

export default EditProfile;