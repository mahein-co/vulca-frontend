/**
 * Format a number with spaces as thousands separators
 * Example: 800000 -> "800 000"
 * @param {string|number} value - The value to format
 * @returns {string} - Formatted value with spaces
 */
export const formatNumberWithSpaces = (value) => {
    if (!value) return '';

    // Remove all non-digit characters except decimal point
    const cleanValue = value.toString().replace(/[^\d.]/g, '');

    // Split into integer and decimal parts
    const parts = cleanValue.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add spaces every 3 digits from the right
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    // Combine with decimal part if it exists
    return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Remove spaces from a formatted number
 * Example: "800 000" -> "800000"
 * @param {string} value - The formatted value
 * @returns {string} - Clean numeric value
 */
export const removeSpacesFromNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/\s/g, '');
};
