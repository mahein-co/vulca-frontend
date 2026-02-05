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

    // Parse DD/MM/YYYY or DD/MM/YY format, accept separators / - . or space
    const match = dateString.match(/^(\d{1,2})[\/\.\-\s](\d{1,2})[\/\.\-\s](\d{2,4})$/);
    if (match) {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        let year = match[3];
        if (year.length === 2) {
            year = `20${year}`;
        }
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

    // French-like formats DD/MM/YYYY, DD/MM/YY, with separators / . - or space
    if (/^\d{1,2}[\/\.\-\s]\d{1,2}[\/\.\-\s]\d{2,4}$/.test(dateString)) {
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

    // Additional parsing attempts for common OCR outputs
    // 1) YYYYMMDD
    if (/^\d{8}$/.test(dateString)) {
        const y = dateString.slice(0, 4);
        const m = dateString.slice(4, 6);
        const d = dateString.slice(6, 8);
        return `${y}-${m}-${d}`;
    }

    // 2) DD.MM.YYYY or DD.MM.YY or DD MM YYYY
    const dmMatch = dateString.match(/^(\d{1,2})[\.\s](\d{1,2})[\.\s](\d{2,4})$/);
    if (dmMatch) {
        let day = dmMatch[1].padStart(2, '0');
        let month = dmMatch[2].padStart(2, '0');
        let year = dmMatch[3];
        if (year.length === 2) {
            year = `20${year}`;
        }
        return `${year}-${month}-${day}`;
    }

    // 3) French month names (e.g., 12 janvier 2024, 5 janv. 24)
    const months = {
        jan: '01', janv: '01', janvier: '01',
        fev: '02', fevr: '02', fév: '02', févr: '02', fevrier: '02', février: '02',
        mar: '03', mars: '03',
        avr: '04', avril: '04',
        mai: '05',
        jun: '06', juin: '06',
        jul: '07', juil: '07', juillet: '07',
        aou: '08', aout: '08', août: '08',
        sep: '09', sept: '09', septembre: '09',
        oct: '10', octobre: '10',
        nov: '11', novembre: '11',
        dec: '12', decem: '12', decembre: '12', décembre: '12', dec: '12', déc: '12'
    };

    const monthNameRegex = new RegExp(`^(\\d{1,2})[\s\-\\./]+([A-Za-zÀ-ÖØ-öø-ÿ\.\'\-]+)[\s\-\\./]+(\\d{2,4})$`);
    const mnMatch = dateString.match(monthNameRegex);
    if (mnMatch) {
        const day = mnMatch[1].padStart(2, '0');
        let mon = mnMatch[2].toLowerCase().replace(/\./g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
        let year = mnMatch[3];
        if (year.length === 2) year = `20${year}`;
        // Try to find month code by prefix matching
        for (const key of Object.keys(months)) {
            if (mon.startsWith(key)) {
                return `${year}-${months[key]}-${day}`;
            }
        }
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
