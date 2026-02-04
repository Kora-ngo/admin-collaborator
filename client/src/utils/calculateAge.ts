/**
 * Calculates age in years from a birth date string (ISO format)
 * @param birthDateStr - ISO date string, e.g. "2000-03-09T23:00:00.000Z"
 * @param prefix - Optional text to prepend (default: "")
 * @param suffix - Optional text to append (default: "")
 * @returns Formatted age string or error message
 */
export function calculateAge(
  birthDateStr: string,
  prefix: string = "",
  suffix: string = ""
): string {
  // Validate input
  if (!birthDateStr || typeof birthDateStr !== "string") {
    return `${prefix}Invalid date${suffix}`;
  }

  const birthDate = new Date(birthDateStr);

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return `${prefix}Invalid date${suffix}`;
  }

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if birthday hasn't occurred this year yet
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Handle future dates or very young ages
  if (age < 0) {
    return `${prefix}Not born yet${suffix}`;
  }

  if (age === 0) {
    return `${prefix}Less than 1 year${suffix}`;
  }

  return `${prefix}${age}${suffix}`;
}