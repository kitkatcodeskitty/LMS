import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import Footer from '../../components/users/Footer';

const Kyc = () => {
  const { backendUrl, getToken, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [myKyc, setMyKyc] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    addressLine1: '',
    phoneNumber: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    idType: 'national_id',
    idNumber: '',
  });
  const [files, setFiles] = useState({ idFront: null, idBack: null, selfie: null });

  const fetchMyKyc = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const { data } = await axios.get(`${backendUrl}/api/kyc/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) setMyKyc(data.kyc);
    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchMyKyc();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onFile = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please login first');
        return;
      }
      const body = new FormData();
      Object.entries(form).forEach(([k, v]) => body.append(k, v));
      if (files.idFront) body.append('idFront', files.idFront);
      if (files.idBack) body.append('idBack', files.idBack);
      if (files.selfie) body.append('selfie', files.selfie);

      const { data } = await axios.post(`${backendUrl}/api/kyc/submit`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success('KYC submitted');
        setMyKyc(data.kyc);
      } else {
        toast.error(data.message || 'Submission failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const status = myKyc?.status || userData?.kycStatus || 'unsubmitted';

  return (
    <div className="flex flex-col min-h-screen">

      <div className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-semibold mb-6">KYC Verification</h1>

          {status !== 'rejected' && status !== 'unsubmitted' ? (
            <div className="p-4 border rounded mb-6">
              <p className="mb-2">
                Status:{' '}
                <span
                  className={`font-medium ${
                    status === 'verified' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {status}
                </span>
              </p>
              {myKyc?.remarks && (
                <p className="text-sm text-gray-600">Remarks: {myKyc.remarks}</p>
              )}
            </div>
          ) : null}

          {(status === 'unsubmitted' || status === 'rejected') && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Full Name" className="border p-2 rounded" required />
                <input name="dob" type="date" value={form.dob} onChange={onChange} placeholder="Date of Birth" className="border p-2 rounded" required />
                <input name="addressLine1" value={form.addressLine1} onChange={onChange} placeholder="Address Line 1" className="border p-2 rounded" required />
                <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} placeholder="Phone Number" className="border p-2 rounded" required />
                <input name="city" value={form.city} onChange={onChange} placeholder="City" className="border p-2 rounded" required />
                <input name="state" value={form.state} onChange={onChange} placeholder="State" className="border p-2 rounded" required />
                <input name="postalCode" value={form.postalCode} onChange={onChange} placeholder="Postal Code" className="border p-2 rounded" required />
                <input name="country" value={form.country} onChange={onChange} placeholder="Country" className="border p-2 rounded" required />
                <select name="idType" value={form.idType} onChange={onChange} className="border p-2 rounded">
                  <option value="national_id">National ID</option>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver License</option>
                </select>
                <input name="idNumber" value={form.idNumber} onChange={onChange} placeholder="ID Number" className="border p-2 rounded" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-1">ID Front</label>
                  <input name="idFront" type="file" accept="image/*" onChange={onFile} className="block w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">ID Back</label>
                  <input name="idBack" type="file" accept="image/*" onChange={onFile} className="block w-full" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Selfie</label>
                  <input name="selfie" type="file" accept="image/*" onChange={onFile} className="block w-full" />
                </div>
              </div>

              <button disabled={loading} type="submit" className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-60">
                {loading ? 'Submitting...' : 'Submit KYC'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Kyc;
