import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ActionButtons from '../../../components/admin/ActionButtons';

describe('ActionButtons', () => {
  const mockWithdrawal = {
    _id: 'withdrawal123',
    status: 'pending',
    amount: 1000,
    user: { name: 'Test User' }
  };

  const mockOnAction = vi.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  it('renders all action buttons for pending withdrawal', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('does not render buttons for non-pending withdrawal', () => {
    const approvedWithdrawal = { ...mockWithdrawal, status: 'approved' };
    
    const { container } = render(
      <ActionButtons 
        withdrawal={approvedWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('calls onAction with correct parameters when Edit is clicked', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnAction).toHaveBeenCalledWith('edit', 'withdrawal123');
  });

  it('calls onAction with correct parameters when Approve is clicked', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByText('Approve'));
    expect(mockOnAction).toHaveBeenCalledWith('approve', 'withdrawal123');
  });

  it('calls onAction with correct parameters when Reject is clicked', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    fireEvent.click(screen.getByText('Reject'));
    expect(mockOnAction).toHaveBeenCalledWith('reject', 'withdrawal123');
  });

  it('renders with labels when showLabels is true', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
        showLabels={true}
      />
    );

    expect(screen.getByText('Edit Details')).toBeInTheDocument();
    expect(screen.getByText('Approve Withdrawal')).toBeInTheDocument();
    expect(screen.getByText('Reject Withdrawal')).toBeInTheDocument();
  });

  it('renders horizontally when layout is horizontal', () => {
    const { container } = render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
        layout="horizontal"
      />
    );

    const buttonContainer = container.firstChild;
    expect(buttonContainer).toHaveClass('flex', 'flex-row', 'gap-3', 'justify-center');
  });

  it('renders vertically when layout is vertical', () => {
    const { container } = render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
        layout="vertical"
      />
    );

    const buttonContainer = container.firstChild;
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'gap-2');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
        disabled={true}
      />
    );

    const editButton = screen.getByText('Edit').closest('button');
    const approveButton = screen.getByText('Approve').closest('button');
    const rejectButton = screen.getByText('Reject').closest('button');

    expect(editButton).toBeDisabled();
    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it('applies correct button variants', () => {
    render(
      <ActionButtons 
        withdrawal={mockWithdrawal} 
        onAction={mockOnAction} 
      />
    );

    const editButton = screen.getByText('Edit').closest('button');
    const approveButton = screen.getByText('Approve').closest('button');
    const rejectButton = screen.getByText('Reject').closest('button');

    // Check for variant-specific classes (these would depend on your Button component implementation)
    expect(editButton).toHaveClass('bg-blue-500'); // info variant
    expect(approveButton).toHaveClass('bg-green-500'); // success variant
    expect(rejectButton).toHaveClass('bg-red-500'); // danger variant
  });
});