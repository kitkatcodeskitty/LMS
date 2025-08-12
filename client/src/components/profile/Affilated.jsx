import React from 'react';

const ReferralCenter = ({ affiliateCode, affiliateLink, copyToClipboard }) => {
  if (!affiliateCode) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Referral Center</h3>
          <p className="text-gray-600 text-sm">Share your code and earn commissions</p>
        </div>
        <div className="text-3xl">🎯</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Code */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Your Referral Code
          </label>
          <div className="flex">
            <input
              type="text"
              value={affiliateCode}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 font-mono text-lg font-bold text-center min-w-0"
            />
            <button
              onClick={() => copyToClipboard(affiliateCode)}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-r-xl hover:from-rose-600 hover:to-pink-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">
            Share Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={affiliateLink}
              readOnly
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl bg-gray-50 text-sm min-w-0"
            />
            <button
              onClick={() => copyToClipboard(affiliateLink)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-r-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-gray-900">Pro Tip</h4>
            <p className="text-sm text-gray-600">
              Share your referral code with friends and earn commission on every
              course they purchase!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralCenter;
