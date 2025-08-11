import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';

const Referral = () => {
  const { userData } = useContext(AppContext);

  const baseUrl = window.location.origin;
  const affiliateCode = userData?.affiliateCode || '';
  const affiliateLink = useMemo(() => (
    affiliateCode ? `${baseUrl}/?ref=${affiliateCode}` : ''
  ), [affiliateCode, baseUrl]);

  if (!userData) {
    return <div className="p-6">Login to view your referral details.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Referral</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Your Referral Code</label>
          <input className="w-full border rounded px-3 py-2" readOnly value={affiliateCode} />
        </div>
        <div>
          <label className="block mb-1 font-medium">Your Affiliate Link</label>
          <input className="w-full border rounded px-3 py-2" readOnly value={affiliateLink} />
        </div>
        <p className="text-sm text-gray-600">Share this link or code with others. If they purchase using your code or link, you’ll earn affiliate rewards.</p>
      </div>
    </div>
  );
};

export default Referral;


