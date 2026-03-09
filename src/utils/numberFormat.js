/**
 * Format a number with spaces as thousands separators and comma as decimal separator
 * Example: 1000000.5 -> "1 000 000,50"
 * @param {string|number} value - The value to format
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} - Formatted value
 */
export const formatNumberWithSpaces = (value, decimals = 2) => {
  if (value === undefined || value === null || value === "") return "";

  const num =
    typeof value === "string" ? parseFloat(value.replace(",", ".")) : value;
  if (isNaN(num)) return value.toString();

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ');
};

/**
 * Format a number as currency (Ar)
 * Example: 1000 -> "1 000,00 Ar"
 */
export const formatCurrency = (amount) => {
  return `${formatNumberWithSpaces(amount)} Ar`;
};

/**
 * Remove spaces from a formatted number
 * Example: "800 000" -> "800000"
 * @param {string} value - The formatted value
 * @returns {string} - Clean numeric value
 */
export const removeSpacesFromNumber = (value) => {
  if (!value) return "";
  return value.toString().replace(/\s/g, "");
};
