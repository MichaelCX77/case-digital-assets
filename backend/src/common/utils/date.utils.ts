import { format, toZonedTime } from 'date-fns-tz';

/**
 * Returns the current date-time as an ISO string for Brazil timezone (UTC-3).
 * Example result: "2025-11-19T15:39:00-03:00"
 */
export function getIsoDate(): string {
  const timeZone = 'America/Sao_Paulo'; // UTC-3
  const now = new Date();
  const zonedDate = toZonedTime(now, timeZone);
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone });
}