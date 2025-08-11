import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const KycReview = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const { data } = await axios.get(`${backendUrl}/api/kyc?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setList(data.kycs);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [filter]);

  const action = async (id, type) => {
    try {
      const token = getToken();
      const url = `${backendUrl}/api/kyc/${id}/${type}`;
      const { data } = await axios.patch(url, { remarks: type === 'reject' ? 'Rejected by admin' : '' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        toast.success(`KYC ${type}ed`);
        setList((prev) => prev.filter((k) => k._id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">KYC Review</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border p-2 rounded">
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((k, idx) => (
            <div
              key={k._id}
              className="bg-white shadow-[0px_0px_15px_rgba(0,0,0,0.09)] p-6 space-y-3 relative overflow-hidden rounded"
            >
              <div className="w-24 h-24 bg-violet-500 rounded-full absolute -right-5 -top-7">
                <p className="absolute bottom-6 left-7 text-white text-2xl">
                  {String(idx + 1).padStart(2, '0')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                {/* Left: Profile */}
                <div className="flex flex-col items-center text-center">
                  <img
                    src={k.user?.imageUrl || '/placeholder-profile.png'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                  <h3 className="font-bold text-lg mt-3">
                    {k.user?.firstName} {k.user?.lastName}
                  </h3>
                  <p className="text-sm text-zinc-500 leading-6 break-words">{k.user?.email}</p>
                </div>

                {/* Right: KYC Details */}
                <div>
                  <div className="text-sm text-zinc-600 space-y-1">
                    {k.fullName && (
                      <div>
                        <span className="text-gray-500">Full Name:</span> {k.fullName}
                      </div>
                    )}
                    {k.phoneNumber && (
                      <div>
                        <span className="text-gray-500">Phone:</span> {k.phoneNumber}
                      </div>
                    )}
                    {k.country && (
                      <div>
                        <span className="text-gray-500">Country:</span> {k.country}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">ID:</span> {k.idType} - {k.idNumber}
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{' '}
                      <span
                        className={
                          k.status === 'verified'
                            ? 'text-green-600'
                            : k.status === 'rejected'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }
                      >
                        {k.status}
                      </span>
                    </div>
                    {k.remarks && <div className="text-gray-600">Remarks: {k.remarks}</div>}
                  </div>

                  <div className="flex gap-3 pt-3">
                    {k.idFrontUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.idFrontUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Front
                      </a>
                    )}
                    {k.idBackUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.idBackUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Back
                      </a>
                    )}
                    {k.selfieUrl && (
                      <a
                        className="text-violet-600 underline text-sm"
                        href={k.selfieUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Selfie
                      </a>
                    )}
                  </div>

                  {k.status === 'pending' && (
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => action(k._id, 'verify')}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => action(k._id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KycReview;


