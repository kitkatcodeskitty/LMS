import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ActionButtons from './ActionButtons';
import WithdrawalEditForm from './WithdrawalEditForm';
import RejectionReasonModal from './RejectionReasonModal';
import ApprovalModal from './ApprovalModal';

const WithdrawalDetailsModal = ({
  isOpen,
  onClose,
  withdrawal,
  onAction,
  currency,
  formatMethod,
  formatDate
}) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  if (!withdrawal) return null;

  const handleAction = async (action, actionData = {}) => {
    if (action === 'edit') {
      setShowEditForm(true);
      return;
    }
    
    if (action === 'approve') {
      setShowApprovalModal(true);
      return;
    }
    
    if (action === 'reject') {
      setShowRejectionModal(true);
      return;
    }

    await onAction(action, withdrawal._id, actionData);
  };

  const handleEditSubmit = async (editData) => {
    await onAction('edit', withdrawal._id, editData);
    setShowEditForm(false);
  };

  const handleApprovalSubmit = async (transactionReference) => {
    await onAction('approve', withdrawal._id, { transactionReference });
    setShowApprovalModal(false);
  };

  const handleRejectSubmit = async (rejectionReason) => {
    await onAction('reject', withdrawal._id, { rejectionReason });
    setShowRejectionModal(false);
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
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
      );
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !showEditForm && !showRejectionModal && !showApprovalModal}
        onClose={onClose}
        title="Withdrawal Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            {getMethodIcon(withdrawal.method)}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {currency}{withdrawal.amount}
                </h3>
                {getStatusBadge(withdrawal.status)}
              </div>
              <p className="text-gray-600">
                {formatMethod(withdrawal.method)} • Requested {formatDate(withdrawal.createdAt)}
              </p>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">User Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{withdrawal.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{withdrawal.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KYC Status:</span>
                    <Badge variant={withdrawal.user.kycStatus === 'verified' ? 'success' : 'warning'}>
                      {withdrawal.user.kycStatus || 'Not Verified'}
                    </Badge>
                  </div>
                  {withdrawal.user.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{withdrawal.user.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Withdrawal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Withdrawal Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request ID:</span>
                    <span className="font-mono text-sm text-gray-900">{withdrawal._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900">{currency}{withdrawal.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium text-gray-900">{formatMethod(withdrawal.method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Details</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {withdrawal.method === 'mobile_banking' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Provider:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.provider || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile Number:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.mobileNumber || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.accountHolderName || 'Not provided'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.bankName || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Number:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.accountNumber || 'Not provided'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Name:</span>
                      <span className="font-medium text-gray-900">
                        {withdrawal.paymentDetails?.accountName || 'Not provided'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Processing Information */}
          {(withdrawal.processedAt || withdrawal.transactionReference || withdrawal.rejectionReason || withdrawal.processedBy) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Processing Information</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {withdrawal.processedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed At:</span>
                    <span className="font-medium text-gray-900">{formatDate(withdrawal.processedAt)}</span>
                  </div>
                )}
                {withdrawal.processedBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processed By:</span>
                    <span className="font-medium text-gray-900">{withdrawal.processedBy.name}</span>
                  </div>
                )}
                {withdrawal.transactionReference && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction Reference:</span>
                    <span className="font-mono text-sm text-gray-900">{withdrawal.transactionReference}</span>
                  </div>
                )}
                {withdrawal.rejectionReason && (
                  <div>
                    <span className="text-gray-600 block mb-1">Rejection Reason:</span>
                    <p className="text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      {withdrawal.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit History */}
          {withdrawal.editHistory && withdrawal.editHistory.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Edit History</h4>
              <div className="space-y-2">
                {withdrawal.editHistory.map((edit, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-900">
                        Edited by {edit.editedBy?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-blue-600">
                        {formatDate(edit.editedAt)}
                      </span>
                    </div>
                    {edit.changes && Object.keys(edit.changes).length > 0 && (
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Changes made:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {Object.entries(edit.changes).map(([key, value]) => (
                            <li key={key}>
                              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {withdrawal.status === 'pending' && (
            <div className="border-t border-gray-200 pt-6">
              <ActionButtons
                withdrawal={withdrawal}
                onAction={handleAction}
                size="md"
                layout="horizontal"
                showLabels={true}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Form Modal */}
      <WithdrawalEditForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        withdrawal={withdrawal}
        onSubmit={handleEditSubmit}
        currency={currency}
        formatMethod={formatMethod}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        withdrawal={withdrawal}
        onSubmit={handleApprovalSubmit}
        currency={currency}
      />

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        withdrawal={withdrawal}
        onSubmit={handleRejectSubmit}
        currency={currency}
      />
    </>
  );
};

export default WithdrawalDetailsModal;