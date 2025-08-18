import React from 'react';
import ProfileImage from '../common/ProfileImage';
import { FaTrophy, FaMedal, FaStar, FaGem, FaCrown, FaUsers, FaMoneyBillWave, FaMapMarkerAlt, FaRocket, FaChartBar } from 'react-icons/fa';

const Leaderboard = ({ leaderboard, userData, currency, earningsData }) => {
  if (leaderboard.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center">
            <FaTrophy className="w-6 h-6 mr-2" />
            Leaderboard
          </h2>
          <p className="text-gray-600">Top performers based on affiliate earnings</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 text-center border border-purple-200">
          <div className="text-6xl mb-4">
            <FaTrophy className="w-24 h-24 mx-auto text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Competition Starting Soon!</h3>
          <p className="text-gray-600">Be the first to earn and claim your spot on the leaderboard</p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <FaRocket className="w-4 h-4 mr-2" />
            Start earning to join the rankings
          </div>
        </div>
      </div>
    );
  }

  const userRank = leaderboard.findIndex(user => user._id === userData._id) + 1;
  // Use the same total earnings calculation as Dashboard for consistency
  const totalEarnings = earningsData?.lifetime || 0;
  const top3 = leaderboard.slice(0, 3);
  const top10 = leaderboard.slice(0, 10);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <FaCrown className="text-yellow-500" />;
      case 1: return <FaMedal className="text-gray-400" />;
      case 2: return <FaMedal className="text-orange-500" />;
      default: return <FaMedal className="text-blue-500" />;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600';
      case 1: return 'from-gray-400 to-gray-600';
      case 2: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getCardStyle = (user, index) => {
    if (user._id === userData._id) {
      return 'bg-gradient-to-r from-rose-50 to-pink-50 border-2 border-rose-300 shadow-lg transform scale-[1.02]';
    }
    if (index < 3) {
      return 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md';
    }
    return 'bg-white border border-gray-200 shadow-sm hover:shadow-md';
  };

  const getProfileImage = (user) => {
    // Check if user has imageUrl and it's not empty
    if (user.imageUrl && user.imageUrl.trim() !== '') {
      return user.imageUrl;
    }
    
    // Create fallback with user's name
    const firstName = user.firstName || 'User';
    const lastName = user.lastName || '';
    const name = `${firstName}+${lastName}`.replace(/\s+/g, '+');
    
    // Generate a consistent color based on user ID
    const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', 'F4A261', '2A9D8F'];
    const colorIndex = user._id ? user._id.charCodeAt(user._id.length - 1) % colors.length : 0;
    const backgroundColor = colors[colorIndex];
    
    return `https://ui-avatars.com/api/?name=${name}&background=${backgroundColor}&color=fff&size=200&bold=true`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center">
            <FaTrophy className="w-6 h-6 mr-2" />
            Leaderboard
          </h2>
        <p className="text-gray-600 mb-4">Top performers based on affiliate earnings</p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
            <FaUsers className="w-4 h-4 mr-1" />
            {leaderboard.length} participants
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            <FaMoneyBillWave className="w-4 h-4 mr-1" />
            {currency}{Math.round(totalEarnings)} lifetime earned
          </span>
          {userRank > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-700">
              <FaMapMarkerAlt className="w-4 h-4 mr-1" />
              Your rank: #{userRank}
            </span>
          )}
        </div>
      </div>

      {/* Top 3 Champions Section */}
      <div className="bg-gradient-to-br from-yellow-50 via-white to-purple-50 rounded-3xl p-8 border-2 border-yellow-200 shadow-xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <FaMedal className="w-6 h-6 mr-2 text-yellow-600" />
            Champions
          </h3>
          <p className="text-gray-600">The elite top 3 performers</p>
        </div>
        
        {/* Desktop Podium */}
        <div className="hidden md:flex items-end justify-center space-x-12 mb-8">
          {[1, 0, 2].map((position) => {
            const user = top3[position];
            if (!user) return null;
            
                         const heights = ['h-32', 'h-40', 'h-28'];
             const iconSizes = ['text-3xl', 'text-4xl', 'text-2xl'];
            
            return (
              <div key={user._id} className="flex flex-col items-center">
                <div className="relative mb-6">
                  <img
                    src={getProfileImage(user)}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-2xl"
                  />
                                     <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 ${iconSizes[position === 0 ? 1 : position === 1 ? 0 : 2]}`}>
                     {getRankIcon(position)}
                   </div>
                  {user._id === userData._id && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">YOU</span>
                    </div>
                  )}
                </div>
                
                <div className={`bg-gradient-to-t ${getRankColor(position)} ${heights[position === 0 ? 1 : position === 1 ? 0 : 2]} w-24 rounded-t-2xl flex flex-col justify-end items-center p-4 shadow-xl`}>
                  <div className="text-white text-center">
                    <div className="font-bold text-xl">#{position + 1}</div>
                    <div className="text-sm opacity-90">{currency}{Math.round(user.affiliateEarnings || 0)}</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="font-bold text-gray-900 text-lg">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-24">{user.email}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Top 3 */}
        <div className="md:hidden space-y-4">
          {top3.map((user, index) => (
            <div key={user._id} className={`p-6 rounded-2xl ${getCardStyle(user, index)} border-2`}>
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(index)} flex items-center justify-center text-white font-bold text-xl shadow-xl relative`}>
                  {index + 1}
                  <div className="absolute -top-2 -right-2 text-2xl">{getRankIcon(index)}</div>
                </div>
                <img
                  src={getProfileImage(user)}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg flex items-center">
                        {user.firstName} {user.lastName}
                        {user._id === userData._id && (
                          <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-full font-bold">YOU</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-xl">{currency}{Math.round(user.affiliateEarnings || 0)}</p>
                      <p className="text-xs text-gray-500">Champion</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 10 Leaderboard */}
      {top10.length > 3 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
            <h3 className="text-xl font-bold flex items-center">
              <FaChartBar className="w-5 h-5 mr-2" />
              Top 10 Leaderboard
              <span className="ml-3 bg-white/20 px-3 py-1 rounded-full text-sm">
                Ranks 4-10
              </span>
            </h3>
            <p className="text-indigo-100 text-sm mt-1">Elite performers competing for the top</p>
          </div>

          <div className="divide-y divide-gray-100">
            {top10.slice(3).map((user, index) => {
              const actualIndex = index + 3;
              return (
                <div key={user._id} className={`p-4 transition-all duration-200 hover:bg-gray-50 ${user._id === userData._id ? 'bg-rose-50 border-l-4 border-rose-400' : ''}`}>
                  {/* Mobile Layout */}
                  <div className="flex items-center space-x-4 sm:hidden">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                      {actualIndex + 1}
                    </div>
                    <img
                      src={getProfileImage(user)}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate flex items-center">
                            {user.firstName} {user.lastName}
                            {user._id === userData._id && (
                              <span className="ml-2 bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">YOU</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-green-600 text-lg">{currency}{Math.round(user.affiliateEarnings || 0)}</p>
                          <p className="text-xs text-gray-500">#{actualIndex + 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {actualIndex + 1}
                        </div>
                        <FaMedal className="text-2xl text-yellow-500" />
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <img
                          src={getProfileImage(user)}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-lg flex items-center">
                            {user.firstName} {user.lastName}
                            {user._id === userData._id && (
                                                              <span className="ml-3 bg-rose-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                                  YOU
                                </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-green-600 text-2xl">{currency}{Math.round(user.affiliateEarnings || 0)}</p>
                      <p className="text-sm text-gray-500">Total Earnings</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm">
              <div className="text-gray-600 mb-2 sm:mb-0">
                Showing top 10 of {leaderboard.length} participants
              </div>
              <div className="text-gray-600">
                {userRank > 10 && (
                  <span className="text-orange-600 font-medium">
                    You're ranked #{userRank} - Keep climbing!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement System */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center flex items-center justify-center">
          <FaTrophy className="w-5 h-5 mr-2 text-purple-600" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl text-center transition-all ${userRank > 0 && userRank <= 10 ? 'bg-green-100 border-2 border-green-300' : 'bg-white border border-gray-200'}`}>
            <div className="text-2xl mb-2">
              <FaTrophy className="w-6 h-6 mx-auto text-blue-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Top 10</div>
            <div className="text-xs text-gray-500 mt-1">
              {userRank > 0 && userRank <= 10 ? 'Achieved!' : 'Reach top 10'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all ${(userData.affiliateEarnings || 0) >= 100 ? 'bg-green-100 border-2 border-green-300' : 'bg-white border border-gray-200'}`}>
            <div className="text-2xl mb-2">
              <FaStar className="w-6 h-6 mx-auto text-yellow-500" />
            </div>
            <div className="text-sm font-medium text-gray-900">Rising Star</div>
            <div className="text-xs text-gray-500 mt-1">
              {(userData.affiliateEarnings || 0) >= 100 ? 'Unlocked!' : 'Earn $100+'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all ${(userData.affiliateEarnings || 0) >= 1000 ? 'bg-green-100 border-2 border-green-300' : 'bg-white border border-gray-200'}`}>
            <div className="text-2xl mb-2">
              <FaGem className="w-6 h-6 mx-auto text-purple-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Elite</div>
            <div className="text-xs text-gray-500 mt-1">
              {(userData.affiliateEarnings || 0) >= 1000 ? 'Achieved!' : 'Earn $1000+'}
            </div>
          </div>
          
          <div className={`p-4 rounded-xl text-center transition-all ${userRank === 1 ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-white border border-gray-200'}`}>
            <div className="text-2xl mb-2">
              <FaCrown className="w-6 h-6 mx-auto text-yellow-600" />
            </div>
            <div className="text-sm font-medium text-gray-900">Champion</div>
            <div className="text-xs text-gray-500 mt-1">
              {userRank === 1 ? 'You\'re #1!' : 'Reach #1'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;