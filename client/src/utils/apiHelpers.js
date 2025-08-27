// Common error handler for API responses
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const message = error.response?.data?.message || error.message || defaultMessage
  console.error(message)
  return message
}

// Common success handler for API responses
export const handleApiSuccess = (response, defaultMessage = 'Operation successful') => {
  const message = response.data?.message || defaultMessage
  console.log(message)
  return message
}

// Generic API call wrapper with error handling
export const apiCall = async (apiFunction, successMessage, errorMessage) => {
  try {
    const response = await apiFunction()
    if (response.data?.success) {
      if (successMessage) handleApiSuccess(response, successMessage)
      return { success: true, data: response.data }
    } else {
      handleApiError({ response }, errorMessage)
      return { success: false, error: response.data?.message }
    }
  } catch (error) {
    handleApiError(error, errorMessage)
    return { success: false, error: error.message }
  }
}

// Common loading state handler
export const withLoading = (setLoading) => async (asyncFunction) => {
  setLoading(true)
  try {
    return await asyncFunction()
  } finally {
    setLoading(false)
  }
}

// Common form validation
export const validateRequired = (fields) => {
  const errors = {}
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`
    }
  })
  return errors
}

// Common email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}