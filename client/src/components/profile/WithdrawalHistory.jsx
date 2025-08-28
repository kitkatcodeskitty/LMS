import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import LoadingSpinner from '../common/LoadingSpinner';
import Badge from '../common/Badge';
import { 
  maskPhoneNumber, 
  maskAccountNumber, 
  maskName, 
  maskBankName 
} from '../../utils/dataMasking';

const WithdrawalHistory = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'status', label: 'Status' }
  ];

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.currentPage, filters]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '10',
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.status) {
        params.append('status', filters.status);
      }

      const { data } = await axios.get(
        `${backendUrl}/api/withdrawals/history?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setWithdrawals(data.data.withdrawals);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch withdrawal history');
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      console.error(error.response?.data?.error?.message || 'Failed to fetch withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' }
    };

    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMethodIcon = (method) => {
    if (method === 'mobile_banking') {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMethod = (method) => {
    return method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer';
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading withdrawal history..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Withdrawal History</h2>
        <div className="mt-2 sm:mt-0 text-sm text-gray-500">
          {pagination.totalCount} total withdrawal{pagination.totalCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      {withdrawals.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals found</h3>
          <p className="text-gray-500">
            {filters.status ? 
              `No withdrawals with status "${filters.status}" found.` : 
              "You haven't made any withdrawal requests yet."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start space-x-4">
                  {getMethodIcon(withdrawal.method)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currency}{withdrawal.amount}
                      </h3>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatMethod(withdrawal.method)}
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Requested: {formatDate(withdrawal.createdAt)}</p>
                      {withdrawal.processedAt && (
                        <p>Processed: {formatDate(withdrawal.processedAt)}</p>
                      )}

                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 sm:mt-0 sm:ml-4 sm:text-right">
                  <div className="text-sm text-gray-600">
                    {withdrawal.method === 'mobile_banking' ? (
                      <div className="space-y-1">
                        <p><span className="font-medium">Provider:</span> {withdrawal.paymentDetails?.provider ? maskBankName(withdrawal.paymentDetails.provider) : '******'}</p>
                        <p><span className="font-medium">Mobile:</span> {withdrawal.paymentDetails?.mobileNumber ? maskPhoneNumber(withdrawal.paymentDetails.mobileNumber) : '******'}</p>
                        <p><span className="font-medium">Name:</span> {withdrawal.paymentDetails?.accountHolderName ? maskName(withdrawal.paymentDetails.accountHolderName) : '******'}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p><span className="font-medium">Bank:</span> {withdrawal.paymentDetails?.bankName ? maskBankName(withdrawal.paymentDetails.bankName) : '******'}</p>
                        <p><span className="font-medium">Account:</span> {withdrawal.paymentDetails?.accountNumber ? maskAccountNumber(withdrawal.paymentDetails.accountNumber) : '******'}</p>
                        <p><span className="font-medium">Name:</span> {withdrawal.paymentDetails?.accountName ? maskName(withdrawal.paymentDetails.accountName) : '******'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{withdrawal.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Processed By */}
              {withdrawal.processedBy && (
                <div className="mt-3 text-xs text-gray-500">
                  Processed by: {withdrawal.processedBy.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && withdrawals.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4">
            <LoadingSpinner size="md" text="Loading..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;