import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WithdrawalDetailsModal from '../../../components/admin/WithdrawalDetailsModal';

describe('WithdrawalDetailsModal', () => {
  const mockMobileBankingWithdrawal = {
    _id: 'withdrawal123',
    amount: 1000,
    status: 'pending',
    method: 'mobile_banking',
    createdAt: '2024-01-01T10:00:00Z',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      kycStatus: 'verified',
      phone: '+1234567890'
    },
    paymentDetails: {
      provider: 'eSewa',
      mobileNumber: '9876543210',
      accountHolderName: 'John Doe'
    }
  };

  const mockBankTransferWithdrawal = {
    _id: 'withdrawal456',
    amount: 2000,
    status: 'approved',
    method: 'bank_transfer',
    createdAt: '2024-01-01T10:00:00Z',
    processedAt: '2024-01-01T11:00:00Z',
    transactionReference: 'TXN123456',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      kycStatus: 'pending'
    },
    paymentDetails: {
      bankName: 'Test Bank',
      accountNumber: '1234567890',
      accountName: 'Jane Smith'
    },
    processedBy: {
      name: 'Admin User'
    },
    editHistory: [
      {
        editedBy: { name: 'Admin User' },
        editedAt: '2024-01-01T10:30:00Z',
        changes: { amount: 2000 }
      }
    ]
  };

  const mockOnAction = vi.fn();
  const mockOnClose = vi.fn();
  const mockFormatMethod = vi.fn((method) => method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer');
  const mockFormatDate = vi.fn((date) => new Date(date).toLocaleDateString());

  beforeEach(() => {
    mockOnAction.mockClear();
    mockOnClose.mockClear();
    mockFormatMethod.mockClear();
    mockFormatDate.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Withdrawal Details')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={false}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.queryByText('Withdrawal Details')).not.toBeInTheDocument();
  });

  it('does not render when withdrawal is null', () => {
    const { container } = render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={null}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays withdrawal header information', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(mockFormatMethod).toHaveBeenCalledWith('mobile_banking');
    expect(mockFormatDate).toHaveBeenCalledWith('2024-01-01T10:00:00Z');
  });

  it('displays user information correctly', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('verified')).toBeInTheDocument();
  });

  it('displays mobile banking payment details', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('eSewa')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays bank transfer payment details', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Test Bank')).toBeInTheDocument();
    expect(screen.getByText('1234567890')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays processing information for processed withdrawals', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Processing Information')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('TXN123456')).toBeInTheDocument();
  });

  it('displays edit history when available', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Edit History')).toBeInTheDocument();
    expect(screen.getByText('Edited by Admin User')).toBeInTheDocument();
  });

  it('shows action buttons for pending withdrawals', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Edit Details')).toBeInTheDocument();
    expect(screen.getByText('Approve Withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Reject Withdrawal')).toBeInTheDocument();
  });

  it('does not show action buttons for non-pending withdrawals', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.queryByText('Edit Details')).not.toBeInTheDocument();
    expect(screen.queryByText('Approve Withdrawal')).not.toBeInTheDocument();
    expect(screen.queryByText('Reject Withdrawal')).not.toBeInTheDocument();
  });

  it('handles approve action', async () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    fireEvent.click(screen.getByText('Approve Withdrawal'));

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('approve', 'withdrawal123', {});
    });
  });

  it('opens edit form when edit action is triggered', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    fireEvent.click(screen.getByText('Edit Details'));

    expect(screen.getByText('Edit Withdrawal Details')).toBeInTheDocument();
  });

  it('opens rejection modal when reject action is triggered', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    expect(screen.getByText('Reject Withdrawal Request')).toBeInTheDocument();
  });

  it('handles edit form submission', async () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    fireEvent.click(screen.getByText('Edit Details'));

    // Modify amount in edit form
    const amountInput = screen.getByLabelText('Withdrawal Amount');
    fireEvent.change(amountInput, { target: { value: '1500' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('edit', 'withdrawal123', expect.objectContaining({
        amount: 1500
      }));
    });
  });

  it('handles rejection form submission', async () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    fireEvent.change(textarea, { target: { value: 'Invalid details' } });

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    await waitFor(() => {
      expect(mockOnAction).toHaveBeenCalledWith('reject', 'withdrawal123', { rejectionReason: 'Invalid details' });
    });
  });

  it('displays withdrawal request ID', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('withdrawal123')).toBeInTheDocument();
  });

  it('displays status badge correctly', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('displays KYC status badge', () => {
    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('verified')).toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    const minimalWithdrawal = {
      _id: 'withdrawal789',
      amount: 500,
      status: 'pending',
      method: 'mobile_banking',
      createdAt: '2024-01-01T10:00:00Z',
      user: {
        name: 'Test User',
        email: 'test@example.com'
      },
      paymentDetails: {}
    };

    render(
      <WithdrawalDetailsModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={minimalWithdrawal}
        onAction={mockOnAction}
        currency="$"
        formatMethod={mockFormatMethod}
        formatDate={mockFormatDate}
      />
    );

    expect(screen.getByText('Not specified')).toBeInTheDocument();
    expect(screen.getByText('Not provided')).toBeInTheDocument();
  });
});