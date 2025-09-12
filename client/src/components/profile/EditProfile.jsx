import React, { useState } from 'react';

const EditProfile = ({ 
  userData, 
  editForm, 
  setEditForm, 
  handleEditProfile, 
  setActiveTab,
  profileEditStatus
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
  const [passwordErrors, setPasswordErrors] = useState({});

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
    
    // Clear errors when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
    
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
      setPasswordErrors({});
    }
  };

  const validatePassword = async () => {
    const errors = {};

    // Check if current password is provided
    if (!passwordData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    // Check if new password is provided
    if (!passwordData.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters long';
    }

    // Check if confirm password matches
    if (!passwordData.confirmPassword.trim()) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'New password and confirm password do not match';
    }

    // Check if new password is different from current password
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    // If there are validation errors, set them and return false
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return false;
    }

    // Clear any previous errors
    setPasswordErrors({});

    // Note: Backend will handle the actual password verification and hashing
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // If password fields are open, validate and update password first
    if (showPasswordFields) {
      if (!await validatePassword()) {
        return;
      }
      
      // Prepare password data for backend
      const passwordUpdateData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      // Update parent editForm with properly structured password data
      setEditForm(prev => ({ 
        ...prev, 
        passwordData: passwordUpdateData
      }));
    }

    // Call the parent handler
    handleEditProfile(e);
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
        {/* Profile Edit Restriction Message */}
        {profileEditStatus?.hasEditedProfile && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  Profile Edit Restriction
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>Your profile has already been edited once and cannot be modified further.</p>
                  {profileEditStatus.profileEditDate && (
                    <p className="mt-1">
                      <strong>Last edited:</strong> {new Date(profileEditStatus.profileEditDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="mt-2">
                    To make additional changes, please contact an administrator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-4 sm:pb-6 border-b border-gray-200 animate-fade-in-up animation-delay-200">
            <div className="relative">
              <img
                src={profilePreviewImage || userData.imageUrl || '/default-avatar.png'}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Photo</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload a new profile photo. JPG, PNG or GIF. Max 5MB.
              </p>
              {profileImageFile && (
                <button
                  type="button"
                  onClick={handleRemoveProfileImage}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove photo
                </button>
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
                  name="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200 ${
                    profileEditStatus?.hasEditedProfile 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'bg-white text-gray-900 hover:border-gray-400'
                  }`}
                  placeholder="Enter your first name"
                  required
                  disabled={profileEditStatus?.hasEditedProfile}
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
                  disabled={profileEditStatus?.hasEditedProfile}
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
                disabled={profileEditStatus?.hasEditedProfile}
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
                  disabled={profileEditStatus?.hasEditedProfile}
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
                      className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-colors duration-200 ${
                        passwordErrors.currentPassword 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-gray-300 hover:border-rose-300'
                      }`}
                      placeholder="Enter your current password"
                      required={showPasswordFields}
                      disabled={profileEditStatus?.hasEditedProfile}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-600 mt-1">{passwordErrors.currentPassword}</p>
                    )}
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
                        className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-colors duration-200 ${
                          passwordErrors.newPassword 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-rose-300'
                        }`}
                        placeholder="Enter new password"
                        required={showPasswordFields}
                        disabled={profileEditStatus?.hasEditedProfile}
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-600 mt-1">{passwordErrors.newPassword}</p>
                      )}
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
                        className={`w-full px-3 sm:px-4 py-2 rounded-lg border focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm transition-colors duration-200 ${
                          passwordErrors.confirmPassword 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300 hover:border-rose-300'
                        }`}
                        placeholder="Confirm new password"
                        required={showPasswordFields}
                        disabled={profileEditStatus?.hasEditedProfile}
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">{passwordErrors.confirmPassword}</p>
                      )}
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
              className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-sm sm:text-base transform transition-all duration-300 ${
                profileEditStatus?.hasEditedProfile
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105'
              }`}
              disabled={profileEditStatus?.hasEditedProfile}
            >
              {profileEditStatus?.hasEditedProfile ? 'Editing Disabled' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 hover:scale-105 transition-all duration-300 font-medium text-sm sm:text-base transform"
              disabled={profileEditStatus?.hasEditedProfile}
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