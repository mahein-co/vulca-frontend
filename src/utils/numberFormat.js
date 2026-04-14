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
 * Format a number while typing, preserving decimal separators and trailing periods/commas.
 * Adds thousand separator spaces only to the integer part.
 * @param {string} value - The raw input value
 * @returns {string} - Permissive formatted value for typing
 */
export const formatNumberTyping = (value) => {
  if (!value) return "";
  
  // 1. Keep only digits and decimal separators
  let cleanValue = value.replace(/[^0-9.,]/g, "");
  
  // 2. Normalize decimal separator (keep the first one found, remove others)
  let parts = cleanValue.split(/[.,]/);
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts.slice(1).join("") : null;
  
  // 3. Format integer part with spaces
  if (integerPart) {
    const num = parseInt(integerPart, 10);
    if (!isNaN(num)) {
      integerPart = new Intl.NumberFormat("fr-FR").format(num).replace(/\u202f/g, ' ').replace(/\u00a0/g, ' ');
    }
  } else if (cleanValue.startsWith('.') || cleanValue.startsWith(',')) {
    integerPart = "0";
  }

  // 4. Reconstruct the number
  let result = integerPart;
  if (decimalPart !== null) {
    // Keep the actual separator used by the user if possible, or default to comma
    const separator = cleanValue.includes(',') ? ',' : '.';
    result += separator + decimalPart;
  }
  
  return result;
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
