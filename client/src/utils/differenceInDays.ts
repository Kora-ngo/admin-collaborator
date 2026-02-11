import { differenceInDays, isValid } from 'date-fns'; // Recommended library
// Or use date-fns-tz if you need timezone support

/**
 * Calculates the number of full days left until the subscription expires.
 * 
 * @param expiresAt - The expiration date (string, Date, or null/undefined)
 * @returns 
 *   - Positive number: days remaining (e.g., 30)
 *   - 0: expires today or already expired
 *   - Negative number: days overdue (e.g., -5)
 */
export const getDaysLeftForSubscription = (expiresAt?: string | Date | null): number => {
  if (!expiresAt) return 0; // No subscription or no date

  const expiresDate = new Date(expiresAt);

  if (!isValid(expiresDate)) return 0; // Invalid date

  const now = new Date(); // Current date/time

  // differenceInDays gives full days between two dates
  // It floors the result, so "today" or "already expired" → 0 or negative
  return differenceInDays(expiresDate, now);
};