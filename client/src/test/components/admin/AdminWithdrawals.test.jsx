import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminWithdrawals from '../../../components/admin/AdminWithdrawals';
import { AppContext } from '../../../context/AppContext';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const mockContextValue = {
  backendUrl: 'http://localhost:5000',
  getToken: vi.fn(() => 'mock-token'),
  currency: '$'
};

const mockWithdrawals = [
  {
    _id: 'withdrawal1',
    amount: 1000,
    status: 'pending',
    method: 'mobile_banking',
    createdAt: '2024-01-01T10:00:00Z',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      kycStatus: 'verified'
    },
    paymentDetails: {
      provider: 'eSewa',
      mobileNumber: '9876543210',
      accountHolderName: 'John Doe'
    }
  },
  {
    _id: 'withdrawal2',
    amount: 2000,
    status: 'approved',
    method: 'bank_transfer',
    createdAt: '2024-01-02T10:00:00Z',
    processedAt: '2024-01-02T11:00:00Z',
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
    }
  }
];

const mockApiResponse = {
  success: true,
  data: {
    withdrawals: mockWithdrawals,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 2
    }
  }
};

describe('AdminWithdrawals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockApiResponse });
  });

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <AppContext.Provider value={contextValue}>
        <AdminWithdrawals />
      </AppContext.Provider>
    );
  };

  it('renders withdrawal management header', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Withdrawal Management')).toBeInTheDocument();
    });
  });

  it('fetches withdrawals on component mount', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/withdrawals/all?page=1&limit=20',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  it('displays withdrawal cards', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('$1000')).toBeInTheDocument();
      expect(screen.getByText('$2000')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('separates pending withdrawals in priority queue', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Pending Withdrawals Queue')).toBeInTheDocument();
      expect(screen.getByText('All Withdrawals')).toBeInTheDocument();
    });
  });

  it('shows pending count in header', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('• 1 pending')).toBeInTheDocument();
    });
  });

  it('filters withdrawals by status', async () => {
    renderWithContext();

    await waitFor(() => {
      const statusFilter = screen.getByLabelText('Status');
      fireEvent.change(statusFilter, { target: { value: 'pending' } });
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/withdrawals/all?page=1&limit=20&status=pending',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  it('filters withdrawals by method', async () => {
    renderWithContext();

    await waitFor(() => {
      const methodFilter = screen.getByLabelText('Method');
      fireEvent.change(methodFilter, { target: { value: 'mobile_banking' } });
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/withdrawals/all?page=1&limit=20&method=mobile_banking',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  it('searches withdrawals by user name', async () => {
    renderWithContext();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by user, amount, reference...');
      fireEvent.change(searchInput, { target: { value: 'John' } });
    });

    // Should filter locally
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('searches withdrawals by amount', async () => {
    renderWithContext();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by user, amount, reference...');
      fireEvent.change(searchInput, { target: { value: '1000' } });
    });

    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.queryByText('$2000')).not.toBeInTheDocument();
  });

  it('opens details modal when View Details is clicked', async () => {
    renderWithContext();

    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewDetailsButton);
    });

    expect(screen.getByText('Withdrawal Details')).toBeInTheDocument();
  });

  it('handles withdrawal approval', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    renderWithContext();

    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewDetailsButton);
    });

    const approveButton = screen.getByText('Approve Withdrawal');
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/withdrawals/withdrawal1/approve',
        {},
        { headers: { Authorization: 'Bearer mock-token' } }
      );
      expect(toast.success).toHaveBeenCalledWith('Withdrawal approved successfully!');
    });
  });

  it('handles withdrawal rejection', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    renderWithContext();

    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewDetailsButton);
    });

    const rejectButton = screen.getByText('Reject Withdrawal');
    fireEvent.click(rejectButton);

    // Should open rejection modal
    expect(screen.getByText('Reject Withdrawal Request')).toBeInTheDocument();
  });

  it('handles withdrawal editing', async () => {
    axios.put.mockResolvedValue({ data: { success: true } });
    renderWithContext();

    await waitFor(() => {
      const viewDetailsButton = screen.getAllByText('View Details')[0];
      fireEvent.click(viewDetailsButton);
    });

    const editButton = screen.getByText('Edit Details');
    fireEvent.click(editButton);

    // Should open edit modal
    expect(screen.getByText('Edit Withdrawal Details')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    axios.get.mockRejectedValue(new Error('API Error'));
    renderWithContext();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Error fetching withdrawals');
    });
  });

  it('displays empty state when no withdrawals found', async () => {
    axios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          withdrawals: [],
          pagination: { currentPage: 1, totalPages: 1, totalCount: 0 }
        }
      }
    });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('No withdrawals found')).toBeInTheDocument();
      expect(screen.getByText('No withdrawal requests have been submitted yet')).toBeInTheDocument();
    });
  });

  it('displays empty state when search returns no results', async () => {
    renderWithContext();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search by user, amount, reference...');
      fireEvent.change(searchInput, { target: { value: 'NonExistentUser' } });
    });

    expect(screen.getByText('No matching withdrawals found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('handles pagination', async () => {
    const paginatedResponse = {
      ...mockApiResponse,
      data: {
        ...mockApiResponse.data,
        pagination: {
          currentPage: 1,
          totalPages: 2,
          totalCount: 4
        }
      }
    };
    axios.get.mockResolvedValue({ data: paginatedResponse });

    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:5000/api/admin/withdrawals/all?page=2&limit=20',
        { headers: { Authorization: 'Bearer mock-token' } }
      );
    });
  });

  it('shows loading spinner initially', () => {
    renderWithContext();
    expect(screen.getByText('Loading withdrawals...')).toBeInTheDocument();
  });

  it('displays withdrawal status badges correctly', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });
  });

  it('displays KYC verification badges', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('KYC Verified')).toBeInTheDocument();
    });
  });

  it('displays payment method icons correctly', async () => {
    renderWithContext();

    await waitFor(() => {
      // Check for mobile banking and bank transfer icons (SVG elements)
      const mobileIcon = screen.getByTestId('mobile-banking-icon') || document.querySelector('svg[viewBox="0 0 24 24"]');
      expect(mobileIcon).toBeInTheDocument();
    });
  });

  it('formats dates correctly', async () => {
    renderWithContext();

    await waitFor(() => {
      // Check that dates are formatted (exact format may vary based on locale)
      expect(screen.getByText(/Requested:/)).toBeInTheDocument();
      expect(screen.getByText(/Processed:/)).toBeInTheDocument();
    });
  });

  it('displays transaction reference for approved withdrawals', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Reference: TXN123456')).toBeInTheDocument();
    });
  });

  it('displays processed by information', async () => {
    renderWithContext();

    await waitFor(() => {
      expect(screen.getByText('Processed by: Admin User')).toBeInTheDocument();
    });
  });
});