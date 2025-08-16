import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RejectionReasonModal from '../../../components/admin/RejectionReasonModal';

describe('RejectionReasonModal', () => {
  const mockWithdrawal = {
    _id: 'withdrawal123',
    amount: 1000,
    method: 'mobile_banking',
    user: { name: 'Test User' }
  };

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.getByText('Reject Withdrawal Request')).toBeInTheDocument();
    expect(screen.getByText('Confirm Rejection')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <RejectionReasonModal
        isOpen={false}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.queryByText('Reject Withdrawal Request')).not.toBeInTheDocument();
  });

  it('displays withdrawal information', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.getByText('Mobile Banking')).toBeInTheDocument();
  });

  it('displays common rejection reasons', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.getByText('Insufficient documentation provided')).toBeInTheDocument();
    expect(screen.getByText('Invalid payment details')).toBeInTheDocument();
    expect(screen.getByText('Account verification required')).toBeInTheDocument();
    expect(screen.getByText('Suspicious activity detected')).toBeInTheDocument();
  });

  it('selects common reason when clicked', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    const reasonButton = screen.getByText('Invalid payment details');
    fireEvent.click(reasonButton);

    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    expect(textarea.value).toBe('Invalid payment details');
  });

  it('allows custom rejection reason input', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    fireEvent.change(textarea, { target: { value: 'Custom rejection reason' } });

    expect(textarea.value).toBe('Custom rejection reason');
  });

  it('submits form with rejection reason', async () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    fireEvent.change(textarea, { target: { value: 'Test rejection reason' } });

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test rejection reason');
    });
  });

  it('submits form with empty reason when no reason provided', async () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('');
    });
  });

  it('trims whitespace from rejection reason', async () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    fireEvent.change(textarea, { target: { value: '  Test reason with spaces  ' } });

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Test reason with spaces');
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('clears form and calls onClose when modal is closed', () => {
    const { rerender } = render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    // Add some text to the textarea
    const textarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    fireEvent.change(textarea, { target: { value: 'Some reason' } });

    // Close modal
    fireEvent.click(screen.getByText('Cancel'));

    // Reopen modal
    rerender(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    // Check that textarea is cleared
    const newTextarea = screen.getByPlaceholderText('Enter a specific reason for rejecting this withdrawal request...');
    expect(newTextarea.value).toBe('');
  });

  it('shows loading state during submission', async () => {
    const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={slowOnSubmit}
        currency="$"
      />
    );

    fireEvent.click(screen.getByText('Reject Withdrawal'));

    expect(screen.getByText('Rejecting...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Rejecting...')).not.toBeInTheDocument();
    });
  });

  it('displays warning message about rejection consequences', () => {
    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.getByText('Important:')).toBeInTheDocument();
    expect(screen.getByText('The user will be notified of this rejection')).toBeInTheDocument();
    expect(screen.getByText('The withdrawal amount will be returned to their available balance')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
  });

  it('shows bank transfer method correctly', () => {
    const bankTransferWithdrawal = {
      ...mockWithdrawal,
      method: 'bank_transfer'
    };

    render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={bankTransferWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
  });

  it('handles null withdrawal gracefully', () => {
    const { container } = render(
      <RejectionReasonModal
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={null}
        onSubmit={mockOnSubmit}
        currency="$"
      />
    );

    expect(container.firstChild).toBeNull();
  });
});