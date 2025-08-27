import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import Badge from '../common/Badge';
import WithdrawalDetailsModal from './WithdrawalDetailsModal';
import ActionButtons from './ActionButtons';

const AdminWithdrawals = () => {
  const { backendUrl, getToken, currency } = useContext(AppContext);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    method: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [fatalError, setFatalError] = useState(null);

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.currentPage, filters]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        console.error('Authentication required. Please log in.');
        setFatalError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: '20'
      });

      if (filters.status) params.append('status', filters.status);
      if (filters.method) params.append('method', filters.method);

      const { data } = await axios.get(
        `${backendUrl}/api/admin/withdrawals/all?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setWithdrawals(data.data.withdrawals);
        setPagination(data.data.pagination);
      } else {
        console.error('Failed to fetch withdrawals');
        setFatalError(data.error?.message || 'Failed to fetch withdrawals');
      }
    } catch (error) {
      setFatalError(error.message || 'Unknown error');
      console.error('Error fetching withdrawals');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalAction = async (action, withdrawalId, actionData = {}) => {
    try {
      const token = getToken();
      if (!token) {
        console.error('Authentication required. Please log in.');
        return;
      }



      const response = await axios.put(
        `${backendUrl}/api/admin/withdrawals/${withdrawalId}/${action}`,
        actionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Check for successful HTTP status first
      if (response.status >= 200 && response.status < 300) {
        const data = response.data;
        
        // Check if the response has success property and it's true
        if (data && data.success === true) {
          console.log(`Withdrawal ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully!`);
          setShowDetailsModal(false);
          setSelectedWithdrawal(null);
          // Refetch withdrawals to update UI immediately
          await fetchWithdrawals();
          return;
        }
        
        // If HTTP status is successful but no success property, assume it worked
        // This handles cases where backend returns 200 but doesn't include success: true
        if (data && !data.hasOwnProperty('success')) {
          console.log(`Withdrawal ${action}${action.endsWith('e') ? 'd' : 'ed'} successfully!`);
          setShowDetailsModal(false);
          setSelectedWithdrawal(null);
          await fetchWithdrawals();
          return;
        }
        
        // If we get here, HTTP was successful but success was false
        console.error(data?.error?.message || data?.message || `Failed to ${action} withdrawal`);
      } else {
        console.error(`HTTP ${response.status}: Failed to ${action} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = `Error ${action}ing withdrawal`;
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action. Please check your permissions.';
      } else if (error.response?.status === 500) {
        // Get detailed error information from backend
        const backendError = error.response?.data?.error;
        if (backendError) {
          errorMessage = `Server Error: ${backendError.message}`;
          if (backendError.details) {
            errorMessage += ` (${backendError.details})`;
          }
        } else {
          errorMessage = 'Internal server error. Please check the console for details.';
        }
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error(errorMessage);
    }
  };

  const openDetailsModal = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
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

  // Filter withdrawals based on search term
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      withdrawal.user.name.toLowerCase().includes(searchLower) ||
      withdrawal.user.email.toLowerCase().includes(searchLower) ||
      withdrawal.amount.toString().includes(searchLower) ||
      (withdrawal.transactionReference && withdrawal.transactionReference.toLowerCase().includes(searchLower))
    );
  });

  // Separate pending withdrawals for priority display
  const pendingWithdrawals = filteredWithdrawals.filter(w => w.status === 'pending');
  const otherWithdrawals = filteredWithdrawals.filter(w => w.status !== 'pending');

  if (fatalError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-2xl font-bold mb-4">Error</div>
          <div className="text-gray-700">{fatalError}</div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (loading && withdrawals.length === 0) {
    return <LoadingSpinner fullScreen text="Loading withdrawals..." />;
  }

  return (
    <div className="min-h-screen flex flex-col md:p-8 p-4 pt-8">
      <div className="w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Withdrawal Management</h2>
            <div className="text-sm text-gray-500 mt-1">
              {filteredWithdrawals.length} of {withdrawals.length} withdrawals shown
              {pendingWithdrawals.length > 0 && (
                <span className="ml-2 text-orange-600 font-medium">
                  • {pendingWithdrawals.length} pending
                </span>
              )}
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by user, amount, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={filters.method}
                onChange={(e) => setFilters(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Methods</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals Queue */}
        {pendingWithdrawals.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Withdrawals Queue</h3>
              <Badge variant="warning" className="ml-2">{pendingWithdrawals.length}</Badge>
            </div>
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <WithdrawalCard
                  key={withdrawal._id}
                  withdrawal={withdrawal}
                  currency={currency}
                  getMethodIcon={getMethodIcon}
                  getStatusBadge={getStatusBadge}
                  formatMethod={formatMethod}
                  formatDate={formatDate}
                  onViewDetails={openDetailsModal}
                  onAction={handleWithdrawalAction}
                  isPending={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Withdrawals */}
        {filteredWithdrawals.length === 0 ? (
          <Card className="text-center" padding="lg">
            <div className="text-gray-400 text-6xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching withdrawals found' : 'No withdrawals found'}
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria' : 'No withdrawal requests have been submitted yet'}
            </p>
          </Card>
        ) : (
          <>
            {otherWithdrawals.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Withdrawals</h3>
                <div className="space-y-4">
                  {otherWithdrawals.map((withdrawal) => (
                    <WithdrawalCard
                      key={withdrawal._id}
                      withdrawal={withdrawal}
                      currency={currency}
                      getMethodIcon={getMethodIcon}
                      getStatusBadge={getStatusBadge}
                      formatMethod={formatMethod}
                      formatDate={formatDate}
                      onViewDetails={openDetailsModal}
                      onAction={handleWithdrawalAction}
                      isPending={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3 mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      <WithdrawalDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedWithdrawal(null);
        }}
        withdrawal={selectedWithdrawal}
        onAction={handleWithdrawalAction}
        currency={currency}
        formatMethod={formatMethod}
        formatDate={formatDate}
      />
    </div>
  );
};

// Withdrawal Card Component
const WithdrawalCard = ({ 
  withdrawal, 
  currency, 
  getMethodIcon, 
  getStatusBadge, 
  formatMethod, 
  formatDate, 
  onViewDetails, 
  onAction,
  isPending 
}) => {
  return (
    <div className={`bg-white rounded-lg border ${isPending ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200'} p-4 sm:p-6`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {getMethodIcon(withdrawal.method)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {currency}{withdrawal.amount}
              </h3>
              {getStatusBadge(withdrawal.status)}
              {withdrawal.user.kycStatus === 'verified' && (
                <Badge variant="success">KYC Verified</Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">User:</p>
                <p className="text-gray-900">{withdrawal.user.name}</p>
                <p className="text-gray-600">{withdrawal.user.email}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Method:</p>
                <p className="text-gray-900">{formatMethod(withdrawal.method)}</p>
                <p className="text-gray-600">Requested: {formatDate(withdrawal.createdAt)}</p>
              </div>
            </div>

            {/* Quick Payment Details Preview */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-700 mb-2">Payment Details:</p>
              {withdrawal.method === 'mobile_banking' ? (
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Provider:</span> {withdrawal.paymentDetails?.provider}</p>
                  <p><span className="font-medium">Mobile:</span> {withdrawal.paymentDetails?.mobileNumber}</p>
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Bank:</span> {withdrawal.paymentDetails?.bankName}</p>
                  <p><span className="font-medium">Account:</span> {withdrawal.paymentDetails?.accountNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 lg:mt-0 lg:ml-4">
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              onClick={() => onViewDetails(withdrawal)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              View Details
            </button>
            {withdrawal.status === 'pending' && (
              <ActionButtons
                withdrawal={withdrawal}
                onAction={(action, withdrawalId) => {
                  // Only edit opens the modal, approve and reject are handled directly
                  if (action === 'edit') {
                    onViewDetails(withdrawal);
                  } else {
                    onAction(action, withdrawalId);
                  }
                }}
                size="sm"
                layout="vertical"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;