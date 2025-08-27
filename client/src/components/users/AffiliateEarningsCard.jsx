import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const AffiliateEarningsCard = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [earnings, setEarnings] = useState({ today: 0, last7: 0, last30: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/users/affiliate/earnings`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await res.json();
        if (data.success) setEarnings(data.earnings);
      } catch (_) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [backendUrl, getToken]);

  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center">
            <span className="text-white font-bold">{currency}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Affiliate Earnings</h3>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500">Today</p>
            <p className="text-base font-semibold text-gray-800">{currency} {Math.round(Number(earnings.today))}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500">Last 7 days</p>
            <p className="text-base font-semibold text-gray-800">{currency} {Math.round(Number(earnings.last7))}</p>
          </div>
          <div className="border rounded-lg p-3">
            <p className="text-xs text-gray-500">Last 30 days</p>
            <p className="text-base font-semibold text-gray-800">{currency} {Math.round(Number(earnings.last30))}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateEarningsCard;


