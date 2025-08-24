// Date formatting utilities
export const formatDate = (dateString, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

export const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};