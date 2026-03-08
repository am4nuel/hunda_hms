/**
 * Centralized storage utility for managing guest identity and data
 * across the website.
 */

/**
 * Returns the existing userId or generates and saves a new UUID.
 * This connects form data and profile history across different browser sessions.
 */
export const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('userId', userId);
  }
  return userId;
};

/**
 * Returns the currently saved guest information, or an empty object.
 */
export const getGuestData = () => {
  try {
    return JSON.parse(localStorage.getItem('guestData') || '{}') || {};
  } catch {
    return {};
  }
};

/**
 * Merges new data into the existing guestData and saves it to localStorage.
 * @param {Object} newData 
 */
export const saveGuestData = (newData) => {
  const current = getGuestData();
  const updated = { ...current, ...newData };
  localStorage.setItem('guestData', JSON.stringify(updated));
  return updated;
};
