/**
 * Format a date in IST using native Intl API
 */
const formatInIST = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions
): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    throw new Error('Invalid date');
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options,
  }).format(parsedDate);
};

/**
 * Format Date → IST (Date only)
 */
export const formatDate = (
  date: string | Date | undefined
): string => {
  if (!date) return '-';

  try {
    return formatInIST(date, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * Format DateTime → IST
 */
export const formatDateTime = (
  date: string | Date | undefined
): string => {
  if (!date) return '-';

  try {
    return formatInIST(date, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
};

/**
 * Format Time → IST
 */
export const formatTime = (
  date: string | Date | undefined
): string => {
  if (!date) return '-';

  try {
    return formatInIST(date, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
};
