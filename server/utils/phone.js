/**
 * Normalizes Ethiopian phone numbers to the local format: 07XXXXXXXX or 09XXXXXXXX.
 * 
 * Examples:
 * +251764314791 -> 0764314791
 * +251964314791 -> 0964314791
 * 764314791     -> 0764314791
 * 0964314791    -> 0964314791
 * 
 * @param {string} phone 
 * @returns {string} Normalized phone number or original if invalid
 */
const normalizePhone = (phone) => {
  if (!phone) return phone;

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle +251 or 251 prefix
  if (cleaned.startsWith('+251')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('251')) {
    cleaned = '0' + cleaned.slice(3);
  }

  // Handle numbers starting with 7 or 9 (9 digits)
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('9'))) {
    cleaned = '0' + cleaned;
  }

  // Final check for 10 digits starting with 07 or 09
  if (/^0[79]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  return phone; // Return original if it doesn't match the expected pattern
};

module.exports = { normalizePhone };
