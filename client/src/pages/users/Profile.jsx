import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import AffiliateEarningsCard from '../../components/users/AffiliateEarningsCard';
import { assets } from '../../assets/assets';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Profile = () => {
  const { userData, navigate } = useContext(AppContext);

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="mb-4">Please login to view your profile.</p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="px-5 py-2 bg-blue-600 text-white rounded"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
  const affiliateCode = userData.affiliateCode;
  const affiliateLink = affiliateCode ? `${window.location.origin}/?ref=${affiliateCode}` : '';

  return (
    <div className="flex items-start justify-center py-12 px-4">
      <div className="flex flex-col md:flex-row gap-4 max-w-4xl w-full mx-auto">
        {/* Profile card */}
        <div className="flex flex-col justify-center w-full max-w-sm md:max-w-sm p-6 shadow-md rounded-xl sm:px-12 bg-white text-gray-800 mx-auto">
          <img
            src={userData.imageUrl || assets.user_icon}
            alt="Profile"
            className="w-32 h-32 mx-auto rounded-full bg-gray-200 aspect-square object-cover"
          />
          <div className="space-y-4 text-center divide-y divide-gray-200">
            <div className="my-2 space-y-1">
              <h2 className="text-xl font-semibold sm:text-2xl">{fullName || userData.email}</h2>
              <p className="px-5 text-xs sm:text-base text-gray-600">{userData.email}</p>
            </div>

            {/* Social icons */}
            <div className="flex justify-center pt-2 space-x-4 items-center">
              <a href="#" className="text-gray-500 hover:text-blue-600 text-lg">
                <FaFacebookF />
              </a>
              <a href="#" className="text-gray-500 hover:text-sky-500 text-lg">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-700 text-lg">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-500 text-lg">
                <FaInstagram />
              </a>
            </div>

            {affiliateCode && (
              <div className="pt-4 text-left space-y-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">Referral Code</label>
                  <input className="w-full border rounded px-3 py-2 text-sm" readOnly value={affiliateCode} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">Affiliate Link</label>
                  <input className="w-full border rounded px-3 py-2 text-sm" readOnly value={affiliateLink} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Affiliate earnings card */}
        <div className="w-full max-w-sm md:w-auto mx-auto">
          <AffiliateEarningsCard />
        </div>
      </div>
    </div>
  );
};

export default Profile;
