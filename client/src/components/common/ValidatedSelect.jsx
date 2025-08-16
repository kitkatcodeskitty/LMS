import React, { useState, useEffect, useCallback } from 'react';
import { validateField, formatErrorMessage } from '../../utils/withdrawalValidation';

/**
 * Validated Select Component with real-time validation
 * Provides comprehensive client-side validation for dropdown selections
 */
const ValidatedSelect = ({
  name,
  value,
  onChange,
  onValidation,
  options = [],
  placeholder = 'Select an option...',
  label,
  required = false,
  disabled = false,
  className = '',
  validationOptions = {},
  showErrorImmediately = false,
  ...props
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate the current value
  const validateValue = useCallback((fieldName, fieldValue, options) => {
    const validation = validateField(fieldName, fieldValue, options);
    const errorMessage = validation.isValid ? '' : validation.error;
    
    setError(errorMessage);
    
    // Notify parent component of validation result
    if (onValidation) {
      onValidation(fieldName, {
        isValid: validation.isValid,
        error: errorMessage,
        sanitizedValue: validation.sanitizedValue
      });
    }
  }, [onValidation]);

  // Validate on value change
  useEffect(() => {
    if (value !== undefined && value !== null && (touched || showErrorImmediately)) {
      validateValue(name, value, validationOptions);
    }
  }, [value, name, validationOptions, touched, showErrorImmediately, validateValue]);

  // Handle select change
  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Call parent onChange
    if (onChange) {
      onChange(e);
    }
    
    // Mark as touched if not already
    if (!touched) {
      setTouched(true);
    }
  };

  // Handle select blur
  const handleBlur = (e) => {
    setTouched(true);
    
    // Trigger immediate validation on blur
    if (value !== undefined && value !== null) {
      validateValue(name, value, validationOptions);
    }
    
    // Call parent onBlur if provided
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Handle select focus
  const handleFocus = (e) => {
    // Clear error on focus for better UX
    if (error && !showErrorImmediately) {
      setError('');
    }
    
    // Call parent onFocus if provided
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  // Determine if we should show the error
  const shouldShowError = error && (touched || showErrorImmediately);

  // Get select styling based on validation state
  const getSelectStyling = () => {
    let baseClasses = 'w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:outline-none appearance-none bg-white';
    
    if (disabled) {
      baseClasses += ' bg-gray-100 cursor-not-allowed';
    }
    
    if (shouldShowError) {
      baseClasses += ' border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200';
    } else if (touched && !error && value) {
      baseClasses += ' border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-200';
    } else {
      baseClasses += ' border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200';
    }
    
    return `${baseClasses} ${className}`;
  };

  // Get label styling
  const getLabelStyling = () => {
    let baseClasses = 'block text-sm font-semibold mb-2';
    
    if (shouldShowError) {
      baseClasses += ' text-red-700';
    } else {
      baseClasses += ' text-gray-700';
    }
    
    return baseClasses;
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label htmlFor={name} className={getLabelStyling()}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Select Container */}
      <div className="relative">
        {/* Select Field */}
        <select
          {...props}
          id={name}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          className={getSelectStyling()}
          aria-invalid={shouldShowError}
          aria-describedby={shouldShowError ? `${name}-error` : undefined}
        >
          {/* Placeholder option */}
          <option value="" disabled>
            {placeholder}
          </option>
          
          {/* Options */}
          {options.map((option) => {
            // Handle both string options and object options
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;
            const optionDisabled = typeof option === 'object' ? option.disabled : false;
            
            return (
              <option
                key={optionValue}
                value={optionValue}
                disabled={optionDisabled}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>
        
        {/* Custom Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {/* Validation Status Icons */}
          {touched && !error && value && (
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          )}
          {shouldShowError && (
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )}
          
          {/* Dropdown Arrow */}
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      
      {/* Error Message */}
      {shouldShowError && (
        <div
          id={`${name}-error`}
          className="flex items-start space-x-2 text-red-600 text-sm animate-fadeIn"
          role="alert"
        >
          <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{formatErrorMessage(error)}</span>
        </div>
      )}
      
      {/* Success Message (optional) */}
      {touched && !error && value && (
        <div className="flex items-center space-x-2 text-green-600 text-sm animate-fadeIn">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Good choice!</span>
        </div>
      )}
    </div>
  );
};

export default ValidatedSelect;