import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WithdrawalEditForm from '../../../components/admin/WithdrawalEditForm';

describe('WithdrawalEditForm', () => {
  const mockMobileBankingWithdrawal = {
    _id: 'withdrawal123',
    amount: 1000,
    method: 'mobile_banking',
    user: { name: 'Test User' },
    paymentDetails: {
      accountHolderName: 'John Doe',
      mobileNumber: '9876543210',
      provider: 'eSewa'
    }
  };

  const mockBankTransferWithdrawal = {
    _id: 'withdrawal456',
    amount: 2000,
    method: 'bank_transfer',
    user: { name: 'Jane Smith' },
    paymentDetails: {
      accountName: 'Jane Smith',
      accountNumber: '1234567890',
      bankName: 'Test Bank'
    }
  };

  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();
  const mockFormatMethod = vi.fn((method) => method === 'mobile_banking' ? 'Mobile Banking' : 'Bank Transfer');

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnClose.mockClear();
    mockFormatMethod.mockClear();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.getByText('Edit Withdrawal Details')).toBeInTheDocument();
    expect(screen.getByText('Current Withdrawal')).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    render(
      <WithdrawalEditForm
        isOpen={false}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.queryByText('Edit Withdrawal Details')).not.toBeInTheDocument();
  });

  it('initializes form with withdrawal data for mobile banking', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
    expect(screen.getByDisplayValue('eSewa')).toBeInTheDocument();
  });

  it('initializes form with withdrawal data for bank transfer', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Bank')).toBeInTheDocument();
  });

  it('shows mobile banking fields for mobile banking withdrawal', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.getByText('Mobile Banking Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Holder Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Mobile Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Provider')).toBeInTheDocument();
  });

  it('shows bank transfer fields for bank transfer withdrawal', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    expect(screen.getByText('Bank Transfer Details')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Number')).toBeInTheDocument();
    expect(screen.getByLabelText('Bank Name')).toBeInTheDocument();
  });

  it('validates required fields and shows errors', async () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    // Clear the amount field
    const amountInput = screen.getByLabelText('Withdrawal Amount');
    fireEvent.change(amountInput, { target: { value: '' } });

    // Clear required mobile banking fields
    const nameInput = screen.getByLabelText('Account Holder Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount greater than 0')).toBeInTheDocument();
      expect(screen.getByText('Account holder name is required')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates mobile number format', async () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    const mobileInput = screen.getByLabelText('Mobile Number');
    fireEvent.change(mobileInput, { target: { value: '123' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit mobile number')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with correct data for mobile banking', async () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    // Modify amount
    const amountInput = screen.getByLabelText('Withdrawal Amount');
    fireEvent.change(amountInput, { target: { value: '1500' } });

    // Modify mobile banking details
    const nameInput = screen.getByLabelText('Account Holder Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 1500,
        mobileBankingDetails: {
          accountHolderName: 'Updated Name',
          mobileNumber: '9876543210',
          provider: 'eSewa'
        }
      });
    });
  });

  it('submits form with correct data for bank transfer', async () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockBankTransferWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    // Modify amount
    const amountInput = screen.getByLabelText('Withdrawal Amount');
    fireEvent.change(amountInput, { target: { value: '2500' } });

    // Modify bank transfer details
    const accountNameInput = screen.getByLabelText('Account Name');
    fireEvent.change(accountNameInput, { target: { value: 'Updated Account Name' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        amount: 2500,
        bankTransferDetails: {
          accountName: 'Updated Account Name',
          accountNumber: '1234567890',
          bankName: 'Test Bank'
        }
      });
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    const slowOnSubmit = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={slowOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    fireEvent.click(screen.getByText('Save Changes'));

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });
  });

  it('clears errors when user corrects input', async () => {
    render(
      <WithdrawalEditForm
        isOpen={true}
        onClose={mockOnClose}
        withdrawal={mockMobileBankingWithdrawal}
        onSubmit={mockOnSubmit}
        currency="$"
        formatMethod={mockFormatMethod}
      />
    );

    // Clear amount to trigger error
    const amountInput = screen.getByLabelText('Withdrawal Amount');
    fireEvent.change(amountInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid amount greater than 0')).toBeInTheDocument();
    });

    // Fix the amount
    fireEvent.change(amountInput, { target: { value: '1000' } });

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid amount greater than 0')).not.toBeInTheDocument();
    });
  });
});