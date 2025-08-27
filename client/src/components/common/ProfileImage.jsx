import React from 'react';

const ProfileImage = ({
  user,
  size = 'md',
  className = '',
  showOnlineStatus = false,
  showVerificationBadge = false,
  onClick = null
}) => {
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  const getProfileImage = (user) => {
    // Check if user has imageUrl and it's not empty
    if (user?.imageUrl && user.imageUrl.trim() !== '') {
      return user.imageUrl;
    }
    
    // Create fallback with user's name
    const firstName = user?.firstName || 'User';
    const lastName = user?.lastName || '';
    const name = `${firstName}+${lastName}`.replace(/\s+/g, '+');
    
    // Generate a consistent color based on user ID or name
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', 'F4A261', '2A9D8F', 'A8E6CF', 'FFB6C1'];
    const colorIndex = user?._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 
                      firstName.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${name}&background=${backgroundColor}&color=fff&size=200&bold=true`;
  };

  const handleImageError = (e) => {
    // Fallback to a simple UI Avatars with default styling
    const firstName = user?.firstName || 'User';
    const lastName = user?.lastName || '';
    e.target.src = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=6366f1&color=fff&size=200&bold=true`;
  };

  return (
    <div className={`relative ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <img
        src={getProfileImage(user)}
        alt={user ? `${user.firstName} ${user.lastName}` : 'Profile'}
        className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200 ${className}`}
        onError={handleImageError}
      />
      
      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
      )}
      
      {/* Instagram-style Verification Badge */}
      {showVerificationBadge && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:shadow-xl transition-all duration-200">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ProfileImage;