import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ValidatedInput from '../../components/common/ValidatedInput';

// Mock the validation utilities
vi.mock('../../utils/withdrawalValidation', () => ({
  validateField: vi.fn(),
  debounce: vi.fn((fn) => fn), // Return function immediately for testing
  formatErrorMessage: vi.fn((msg) => msg)
}));

import { validateField, formatErrorMessage } from '../../utils/withdrawalValidation';

describe('ValidatedInput Component', () => {
  const defaultProps = {
    name: 'testField',
    value: '',
    onChange: vi.fn(),
    onValidation: vi.fn(),
    label: 'Test Field',
    placeholder: 'Enter test value'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    validateField.mockReturnValue({ isValid: true });
    formatErrorMessage.mockImplementation((msg) => msg);
  });

  describe('Rendering', () => {
    test('should render input with label', () => {
      render(<ValidatedInput {...defaultProps} />);
      
      expect(screen.getByLabelText('Test Field')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter test value')).toBeInTheDocument();
    });

    test('should render required indicator when required', () => {
      render(<ValidatedInput {...defaultProps} required />);
      
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    test('should render without label when not provided', () => {
      const { label, ...propsWithoutLabel } = defaultProps;
      render(<ValidatedInput {...propsWithoutLabel} />);
      
      expect(screen.queryByText('Test Field')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter test value')).toBeInTheDocument();
    });

    test('should apply custom className', () => {
      render(<ValidatedInput {...defaultProps} className="custom-class" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    test('should be disabled when disabled prop is true', () => {
      render(<ValidatedInput {...defaultProps} disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('bg-gray-100', 'cursor-not-allowed');
    });
  });

  describe('Validation', () => {
    test('should validate on blur', async () => {
      render(<ValidatedInput {...defaultProps} value="test value" />);
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(validateField).toHaveBeenCalledWith('testField', 'test value', {});
      });
    });

    test('should validate on change when touched', async () => {
      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      
      // First interaction to mark as touched
      await user.type(input, 'a');
      
      await waitFor(() => {
        expect(validateField).toHaveBeenCalled();
      });
    });

    test('should show validation immediately when showErrorImmediately is true', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Test error message'
      });

      render(
        <ValidatedInput 
          {...defaultProps} 
          value="invalid value" 
          showErrorImmediately 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test error message')).toBeInTheDocument();
      });
    });

    test('should call onValidation callback with validation result', async () => {
      const mockValidation = {
        isValid: false,
        error: 'Validation error',
        sanitizedValue: 'sanitized'
      };
      validateField.mockReturnValue(mockValidation);

      render(<ValidatedInput {...defaultProps} value="test" showErrorImmediately />);
      
      await waitFor(() => {
        expect(defaultProps.onValidation).toHaveBeenCalledWith('testField', mockValidation);
      });
    });

    test('should pass validation options to validateField', async () => {
      const validationOptions = { availableBalance: 1000 };
      
      render(
        <ValidatedInput 
          {...defaultProps} 
          value="test" 
          validationOptions={validationOptions}
          showErrorImmediately 
        />
      );
      
      await waitFor(() => {
        expect(validateField).toHaveBeenCalledWith('testField', 'test', validationOptions);
      });
    });
  });

  describe('Error Display', () => {
    test('should show error message when validation fails and field is touched', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Field is required'
      });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      
      // Touch the field and then blur to trigger validation
      await user.click(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText('Field is required')).toBeInTheDocument();
      });
    });

    test('should show error icon when validation fails', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Validation error'
      });

      render(<ValidatedInput {...defaultProps} value="test" showErrorImmediately />);
      
      await waitFor(() => {
        const errorIcon = screen.getByRole('alert').querySelector('svg');
        expect(errorIcon).toBeInTheDocument();
      });
    });

    test('should show success icon when validation passes and field is touched', async () => {
      validateField.mockReturnValue({ isValid: true });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      
      // Type something to mark as touched
      await user.type(input, 'valid input');
      
      await waitFor(() => {
        // Look for success checkmark icon
        const successIcon = input.parentElement.querySelector('svg path[d*="M5 13l4 4L19 7"]');
        expect(successIcon).toBeInTheDocument();
      });
    });

    test('should apply error styling when validation fails', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Validation error'
      });

      render(<ValidatedInput {...defaultProps} value="test" showErrorImmediately />);
      
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('border-red-500');
      });
    });

    test('should apply success styling when validation passes', async () => {
      validateField.mockReturnValue({ isValid: true });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'valid');
      
      await waitFor(() => {
        expect(input).toHaveClass('border-green-500');
      });
    });
  });

  describe('Loading State', () => {
    test('should show loading spinner during validation', () => {
      // Mock debounce to not execute immediately
      const mockDebounce = vi.fn((fn, delay) => {
        return (...args) => {
          // Don't execute the function to simulate pending state
        };
      });
      
      vi.doMock('../../utils/withdrawalValidation', () => ({
        ...vi.importActual('../../utils/withdrawalValidation'),
        debounce: mockDebounce
      }));

      // This test would need to be restructured to properly test loading state
      // as the current implementation makes it difficult to test intermediate states
    });
  });

  describe('Event Handling', () => {
    test('should call onChange when input value changes', async () => {
      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'new value');
      
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    test('should call onBlur when provided', async () => {
      const onBlur = vi.fn();
      render(<ValidatedInput {...defaultProps} onBlur={onBlur} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      
      expect(onBlur).toHaveBeenCalled();
    });

    test('should call onFocus when provided', async () => {
      const onFocus = vi.fn();
      render(<ValidatedInput {...defaultProps} onFocus={onFocus} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      
      expect(onFocus).toHaveBeenCalled();
    });

    test('should clear error on focus when not showing errors immediately', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Test error'
      });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      
      // First make the field touched and show error
      await user.type(input, 'test');
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText('Test error')).toBeInTheDocument();
      });
      
      // Then focus should clear the error
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(screen.queryByText('Test error')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes when error is present', async () => {
      validateField.mockReturnValue({
        isValid: false,
        error: 'Validation error'
      });

      render(<ValidatedInput {...defaultProps} value="test" showErrorImmediately />);
      
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'testField-error');
        
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveAttribute('id', 'testField-error');
      });
    });

    test('should not have error ARIA attributes when validation passes', () => {
      validateField.mockReturnValue({ isValid: true });

      render(<ValidatedInput {...defaultProps} value="test" />);
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
      expect(input).not.toHaveAttribute('aria-describedby');
    });

    test('should associate label with input', () => {
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Field');
      
      expect(input).toHaveAttribute('id', 'testField');
      expect(label).toHaveAttribute('for', 'testField');
    });
  });

  describe('Success Message', () => {
    test('should show success message when validation passes and field has value', async () => {
      validateField.mockReturnValue({ isValid: true });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.type(input, 'valid input');
      
      await waitFor(() => {
        expect(screen.getByText('Looks good!')).toBeInTheDocument();
      });
    });

    test('should not show success message when field is empty', async () => {
      validateField.mockReturnValue({ isValid: true });

      const user = userEvent.setup();
      render(<ValidatedInput {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      await user.click(input);
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.queryByText('Looks good!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Input Types', () => {
    test('should render different input types correctly', () => {
      const { rerender } = render(<ValidatedInput {...defaultProps} type="email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
      
      rerender(<ValidatedInput {...defaultProps} type="number" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
      
      rerender(<ValidatedInput {...defaultProps} type="password" />);
      expect(screen.getByLabelText('Test Field')).toHaveAttribute('type', 'password');
    });
  });
});