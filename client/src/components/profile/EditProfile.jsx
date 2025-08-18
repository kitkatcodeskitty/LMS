import React from 'react';

const EditProfile = ({ 
  userData, 
  editForm, 
  setEditForm, 
  handleEditProfile, 
  setActiveTab, 
  currency 
}) => {
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
            <img
              src={userData.imageUrl || '/default-avatar.png'}
              alt="Profile"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-rose-200 mx-auto sm:mx-0 hover:scale-105 transition-transform duration-300"
            />
            <div className="text-center sm:text-left">
              <button
                type="button"
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 hover:scale-105 transition-all duration-300 text-sm font-medium transform"
              >
                Change Photo
              </button>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base hover:border-rose-300 transition-colors duration-200"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm sm:text-base resize-none hover:border-rose-300 transition-colors duration-200"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-gray-500 mt-1">Brief description about yourself (optional)</p>
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

      {/* Account Information */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-fade-in-up animation-delay-500 hover:shadow-lg transition-all duration-300">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Account Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <p className="text-sm text-gray-900">{userData.isAdmin ? 'Administrator' : 'Student'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
            <p className="text-sm text-gray-900">
              {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Code</label>
            <p className="text-sm text-gray-900 font-mono">{userData.affiliateCode || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Earnings</label>
            <p className="text-sm text-green-600 font-medium">
              {currency}{Math.round(userData.affiliateEarnings || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Bio Display Section */}
      {userData.bio && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-fade-in-up animation-delay-600 hover:shadow-lg transition-all duration-300">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">About Me</h3>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {userData.bio}
          </p>
        </div>
      )}
    </div>
  );
};

export default EditProfile;