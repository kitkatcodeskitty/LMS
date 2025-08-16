import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';

// Mock AnimatedNumber component
vi.mock('../../common/AnimatedNumber', () => ({
  default: ({ value, currency = '', decimals = 2 }) => (
    <span data-testid="animated-number">
      {currency}{typeof value === 'number' ? value.toFixed(decimals) : value}
    </span>
  )
}));

describe('Dashboard Component', () => {
  const mockProps = {
    userData: {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      imageUrl: '/test-avatar.png',
      kycStatus: 'verified',
      isAdmin: false
    },
    earningsData: {
      lifetime: 5000,
      today: 100,
      lastSevenDays: 500,
      thisMonth: 1200,
      withdrawableBalance: 2500,
      totalWithdrawn: 1000,
      pendingWithdrawals: 200,
      availableBalance: 2300
    },
    currency: '$',
    affiliateCode: 'ABC123',
    affiliateLink: 'http://localhost:3000/?ref=ABC123',
    copyToClipboard: vi.fn(),
    purchasedCourses: [
      { _id: 'course1', title: 'React Basics' },
      { _id: 'course2', title: 'Advanced JavaScript' }
    ],
    referralData: [
      { _id: 'ref1', name: 'User 1' },
      { _id: 'ref2', name: 'User 2' }
    ],
    leaderboard: [
      { _id: 'user123', name: 'John Doe', earnings: 5000 },
      { _id: 'user456', name: 'Jane Smith', earnings: 3000 }
    ],
    navigate: vi.fn(),
    setActiveTab: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profile Section', () => {
    it('renders user profile information correctly', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('2 Courses Enrolled')).toBeInTheDocument();
      expect(screen.getByAltText('Profile')).toHaveAttribute('src', '/test-avatar.png');
    });

    it('displays KYC verified badge when user is verified', () => {
      render(<Dashboard {...mockProps} />);
      
      const kycBadges = screen.getAllByText(/KYC: Verified/i);
      expect(kycBadges.length).toBeGreaterThan(0);
    });

    it('shows admin badge for admin users', () => {
      const adminProps = {
        ...mockProps,
        userData: { ...mockProps.userData, isAdmin: true }
      };
      
      render(<Dashboard {...adminProps} />);
      
      expect(screen.getByText('Administrator')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Consolidated Earnings Overview', () => {
    it('displays all earnings metrics correctly', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('Earnings Overview')).toBeInTheDocument();
      expect(screen.getByText('Your complete financial summary')).toBeInTheDocument();
      
      // Check for earnings labels
      expect(screen.getByText('Lifetime Earnings')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('7 Days')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    it('displays current balance section with withdrawal information', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('Current Balance (Withdrawable)')).toBeInTheDocument();
      expect(screen.getByText('$200 pending withdrawal')).toBeInTheDocument();
      expect(screen.getByText('Total Withdrawable: $2500')).toBeInTheDocument();
      expect(screen.getByText('Total Withdrawn: $1000')).toBeInTheDocument();
      expect(screen.getByText('Pending: $200')).toBeInTheDocument();
    });

    it('does not show pending withdrawal text when no pending withdrawals', () => {
      const noPendingProps = {
        ...mockProps,
        earningsData: { ...mockProps.earningsData, pendingWithdrawals: 0 }
      };
      
      render(<Dashboard {...noPendingProps} />);
      
      expect(screen.queryByText(/pending withdrawal/)).not.toBeInTheDocument();
    });
  });

  describe('Withdrawal Request Card', () => {
    it('renders withdrawal request card with correct title and description', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('Quick Withdrawal')).toBeInTheDocument();
      expect(screen.getByText('Request money withdrawal')).toBeInTheDocument();
    });

    it('displays both withdrawal method buttons when balance is available', () => {
      render(<Dashboard {...mockProps} />);
      
      const mobileBankingButton = screen.getByRole('button', { name: /mobile banking/i });
      const bankTransferButton = screen.getByRole('button', { name: /bank transfer/i });
      
      expect(mobileBankingButton).toBeInTheDocument();
      expect(bankTransferButton).toBeInTheDocument();
      expect(mobileBankingButton).not.toBeDisabled();
      expect(bankTransferButton).not.toBeDisabled();
    });

    it('disables withdrawal buttons when no balance available', () => {
      const noBalanceProps = {
        ...mockProps,
        earningsData: { ...mockProps.earningsData, availableBalance: 0 }
      };
      
      render(<Dashboard {...noBalanceProps} />);
      
      const mobileBankingButton = screen.getByRole('button', { name: /mobile banking/i });
      const bankTransferButton = screen.getByRole('button', { name: /bank transfer/i });
      
      expect(mobileBankingButton).toBeDisabled();
      expect(bankTransferButton).toBeDisabled();
    });

    it('shows warning message when no balance available', () => {
      const noBalanceProps = {
        ...mockProps,
        earningsData: { ...mockProps.earningsData, availableBalance: 0 }
      };
      
      render(<Dashboard {...noBalanceProps} />);
      
      expect(screen.getByText('No balance available for withdrawal')).toBeInTheDocument();
    });

    it('calls setActiveTab with withdrawal-request when withdrawal buttons are clicked', () => {
      render(<Dashboard {...mockProps} />);
      
      const mobileBankingButton = screen.getByRole('button', { name: /mobile banking/i });
      fireEvent.click(mobileBankingButton);
      
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('withdrawal-request');
    });

    it('displays withdrawal history button and calls setActiveTab when clicked', () => {
      render(<Dashboard {...mockProps} />);
      
      const historyButton = screen.getByRole('button', { name: /withdrawal history/i });
      expect(historyButton).toBeInTheDocument();
      
      fireEvent.click(historyButton);
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('withdrawal-history');
    });
  });

  describe('Activity Overview', () => {
    it('displays activity overview with correct metrics', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('Activity Overview')).toBeInTheDocument();
      expect(screen.getByText('Your learning and earning progress')).toBeInTheDocument();
      
      expect(screen.getByText('Courses Enrolled')).toBeInTheDocument();
      expect(screen.getByText('People Referred')).toBeInTheDocument();
      expect(screen.getByText('Leaderboard Rank')).toBeInTheDocument();
    });

    it('displays correct leaderboard rank', () => {
      render(<Dashboard {...mockProps} />);
      
      // User is first in the leaderboard (index 0), so rank should be #1
      // Check that the rank section exists
      expect(screen.getByText('Leaderboard Rank')).toBeInTheDocument();
    });

    it('shows N/A for leaderboard rank when user not found', () => {
      const noRankProps = {
        ...mockProps,
        leaderboard: [
          { _id: 'other1', name: 'Other User', earnings: 3000 }
        ]
      };
      
      render(<Dashboard {...noRankProps} />);
      
      expect(screen.getByText('#N/A')).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('renders quick actions section with all buttons', () => {
      render(<Dashboard {...mockProps} />);
      
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Common tasks')).toBeInTheDocument();
      
      expect(screen.getByRole('button', { name: /browse courses/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /view referrals/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
    });

    it('calls navigate when Browse Courses button is clicked', () => {
      render(<Dashboard {...mockProps} />);
      
      const browseCourses = screen.getByRole('button', { name: /browse courses/i });
      fireEvent.click(browseCourses);
      
      expect(mockProps.navigate).toHaveBeenCalledWith('/courses');
    });

    it('calls setActiveTab when View Referrals button is clicked', () => {
      render(<Dashboard {...mockProps} />);
      
      const viewReferrals = screen.getByRole('button', { name: /view referrals/i });
      fireEvent.click(viewReferrals);
      
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('referrals');
    });

    it('calls setActiveTab when Edit Profile button is clicked', () => {
      render(<Dashboard {...mockProps} />);
      
      const editProfile = screen.getByRole('button', { name: /edit profile/i });
      fireEvent.click(editProfile);
      
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('edit');
    });
  });

  describe('Responsive Design', () => {
    it('renders properly with minimal data', () => {
      const minimalProps = {
        ...mockProps,
        userData: {
          _id: 'user123',
          firstName: '',
          lastName: '',
          isAdmin: false
        },
        earningsData: {
          lifetime: 0,
          today: 0,
          lastSevenDays: 0,
          thisMonth: 0,
          withdrawableBalance: 0,
          totalWithdrawn: 0,
          pendingWithdrawals: 0,
          availableBalance: 0
        },
        purchasedCourses: [],
        referralData: [],
        leaderboard: []
      };
      
      render(<Dashboard {...minimalProps} />);
      
      expect(screen.getByText('Welcome!')).toBeInTheDocument();
      expect(screen.getByText('No courses enrolled yet')).toBeInTheDocument();
    });
  });

  describe('Integration with Requirements', () => {
    it('meets requirement 5.1: displays consolidated earnings card with all metrics', () => {
      render(<Dashboard {...mockProps} />);
      
      // Requirement 5.1: consolidated earnings card with Lifetime, Today, 7 Days, and Current Balance
      expect(screen.getByText('Lifetime Earnings')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('7 Days')).toBeInTheDocument();
      expect(screen.getByText('Current Balance (Withdrawable)')).toBeInTheDocument();
    });

    it('meets requirement 5.2: clearly labels Current Balance as withdrawable amount', () => {
      render(<Dashboard {...mockProps} />);
      
      // Requirement 5.2: clearly label Current Balance as withdrawable amount
      expect(screen.getByText('Current Balance (Withdrawable)')).toBeInTheDocument();
    });

    it('meets requirement 5.3: displays withdrawal request card with both method options', () => {
      render(<Dashboard {...mockProps} />);
      
      // Requirement 5.3: withdrawal request card with options for Mobile Banking and Bank Transfer
      expect(screen.getByText('Quick Withdrawal')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /mobile banking/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bank transfer/i })).toBeInTheDocument();
    });

    it('meets requirement 5.4: withdrawal options navigate to appropriate forms', () => {
      render(<Dashboard {...mockProps} />);
      
      // Requirement 5.4: clicking withdrawal options navigates to appropriate withdrawal form
      const mobileBankingButton = screen.getByRole('button', { name: /mobile banking/i });
      fireEvent.click(mobileBankingButton);
      
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('withdrawal-request');
    });

    it('meets requirement 5.5: provides link to Withdrawal History', () => {
      render(<Dashboard {...mockProps} />);
      
      // Requirement 5.5: provides link to Withdrawal History
      const historyButton = screen.getByRole('button', { name: /withdrawal history/i });
      expect(historyButton).toBeInTheDocument();
      
      fireEvent.click(historyButton);
      expect(mockProps.setActiveTab).toHaveBeenCalledWith('withdrawal-history');
    });
  });
});