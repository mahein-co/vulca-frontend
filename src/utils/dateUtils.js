/**
 * Centralized date utility functions to ensure consistent date formatting
 * across the application, preventing locale-based misinterpretation.
 */

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * This ensures the date is always in the correct format for HTML date inputs
 * and backend processing, regardless of the user's locale.
 * 
 * @returns {string} Today's date in YYYY-MM-DD format
 */
export const getTodayISO = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse a French date string (DD/MM/YYYY) and convert to ISO format (YYYY-MM-DD)
 * 
 * @param {string} dateString - Date in DD/MM/YYYY format
 * @returns {string} Date in YYYY-MM-DD format, or empty string if invalid
 */
export const parseFrenchDate = (dateString) => {
    if (!dateString) return '';

    // Check if it's already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // Parse DD/MM/YYYY format
    const match = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${month}-${day}`;
    }

    return '';
};

/**
 * Format any date string to ISO format (YYYY-MM-DD)
 * Handles multiple input formats and ensures consistent output
 * 
 * @param {string|Date} dateInput - Date in various formats
 * @returns {string} Date in YYYY-MM-DD format, or empty string if invalid
 */
export const formatDateToISO = (dateInput) => {
    if (!dateInput) return '';

    // If it's already a Date object
    if (dateInput instanceof Date) {
        const year = dateInput.getFullYear();
        const month = String(dateInput.getMonth() + 1).padStart(2, '0');
        const day = String(dateInput.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const dateString = String(dateInput).trim();

    // Already in ISO format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }

    // French format DD/MM/YYYY
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(dateString)) {
        return parseFrenchDate(dateString);
    }

    // Try parsing as a standard date string
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return formatDateToISO(date);
        }
    } catch (e) {
        // Invalid date
    }

    return '';
};

/**
 * Format a date for display in French format (DD/MM/YYYY)
 * 
 * @param {string} isoDate - Date in YYYY-MM-DD format
 * @returns {string} Date in DD/MM/YYYY format
 */
export const formatDateToFrench = (isoDate) => {
    if (!isoDate) return '';

    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    return isoDate;
};
