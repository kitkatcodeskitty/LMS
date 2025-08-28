# Data Masking Utilities

This directory contains utility functions for masking sensitive information in the UI to protect user privacy and security.

## Overview

The data masking utilities provide functions to hide sensitive information like account numbers, phone numbers, emails, and names while still showing enough information for users to identify their data.

## Functions

### `maskPhoneNumber(phoneNumber)`
Masks phone numbers by showing only the first 2 and last 2 digits, replacing the middle with 'x' characters.

**Example:**
- Input: `"9876543210"` → Output: `"98xxxxxx10"`
- Input: `"+9779876543210"` → Output: `"98xxxxxx10"`

### `maskAccountNumber(accountNumber)`
Masks account numbers by showing only the first 2 and last 2 characters, replacing the middle with 'x' characters.

**Example:**
- Input: `"1234567890"` → Output: `"12xxxxxx90"`
- Input: `"ABCD123456"` → Output: `"ABxxxxxx56"`

### `maskEmail(email)`
Masks email addresses by showing only the first character of the local part and the full domain.

**Example:**
- Input: `"user@example.com"` → Output: `"uxxx@example.com"`
- Input: `"john.doe@company.org"` → Output: `"jxxxxxxxxx@company.org"`

### `maskName(name)`
Masks names by showing only the first and last character, replacing the middle with 'x' characters.

**Example:**
- Input: `"John Doe"` → Output: `"Jxx Dxx"`
- Input: `"Alice"` → Output: `"Axxx"`

### `maskBankName(name)`
Masks bank or provider names by showing only the first 3 characters, replacing the rest with 'x' characters.

**Example:**
- Input: `"Nepal Bank"` → Output: `"Nepxxxxx"`
- Input: `"Standard Chartered"` → Output: `"Staxxxxxx"`

### `maskSensitiveText(text, minLength = 3)`
Generic function to mask any sensitive text by showing only the first and last character.

**Example:**
- Input: `"sensitive"` → Output: `"sxxxxxxxx"`
- Input: `"secret"` → Output: `"sxxxxx"`

## Usage

```javascript
import { 
  maskPhoneNumber, 
  maskAccountNumber, 
  maskEmail, 
  maskName, 
  maskBankName 
} from '../../utils/dataMasking';

// In your component
const maskedPhone = maskPhoneNumber(user.phone);
const maskedAccount = maskAccountNumber(withdrawal.accountNumber);
const maskedEmail = maskEmail(user.email);
```

## Security Features

1. **Consistent Masking**: All functions use consistent 'x' characters for masking
2. **Fallback Values**: Returns `'******'` for invalid or empty input
3. **Minimum Length Protection**: Prevents masking of very short strings that could be easily guessed
4. **Input Validation**: Handles null, undefined, and empty string inputs gracefully

## Implementation in Components

The masking functions are currently implemented in:

- `WithdrawalHistory.jsx` - User withdrawal history view (ONLY)

**Note:** Data masking is intentionally NOT applied in admin components to allow administrators full visibility of withdrawal details for proper verification and processing.

## Testing

Run the test suite to verify masking functions work correctly:

```bash
npm test -- dataMasking.test.js
```

## Best Practices

1. **Always use masking for sensitive data** displayed in the UI
2. **Test edge cases** like empty strings, null values, and very short inputs
3. **Keep masking consistent** across all components
4. **Document any changes** to masking logic
5. **Consider user experience** - ensure masked data is still identifiable
