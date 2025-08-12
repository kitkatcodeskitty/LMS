// Color palette
export const COLORS = {
  primary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899', // Main rose color
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  },
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    600: '#059669'
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706'
  },
  danger: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626'
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    600: '#2563eb'
  }
};

// Spacing scale
export const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '0.75rem',  // 12px
  md: '1rem',     // 16px
  lg: '1.5rem',   // 24px
  xl: '2rem',     // 32px
  '2xl': '3rem',  // 48px
  '3xl': '4rem'   // 64px
};

// Typography scale
export const TYPOGRAPHY = {
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
};

// Border radius
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px'
};

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

// Animation durations
export const ANIMATION = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
  slower: '500ms'
};

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Z-index scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070
};

// Common component sizes
export const COMPONENT_SIZES = {
  button: {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    xl: { padding: '1rem 2rem', fontSize: '1.125rem' }
  },
  input: {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.625rem 1rem', fontSize: '0.875rem' },
    lg: { padding: '0.75rem 1rem', fontSize: '1rem' }
  }
};

// Status colors
export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  verified: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
};