/**
 * Local calendar arithmetic. Reviews are due on calendar dates in the
 * learner's time zone, so daylight-saving transitions never shift a due day.
 */

/**
 * Check that an IANA time zone name is supported by this runtime.
 * @param timeZone - candidate zone name.
 * @returns whether `Intl` accepts the zone.
 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone }).format(0)
    return true
  } catch {
    return false
  }
}

function parts(instant: Date, timeZone: string): Record<string, string> {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(instant)
  return Object.fromEntries(formatted.map(part => [part.type, part.value]))
}

/**
 * The calendar date of an instant in a time zone.
 * @param instant - wall-clock instant.
 * @param timeZone - IANA zone.
 * @returns `YYYY-MM-DD`.
 */
export function localDate(instant: Date, timeZone: string): string {
  const value = parts(instant, timeZone)
  return `${value['year'] ?? ''}-${value['month'] ?? ''}-${value['day'] ?? ''}`
}

/**
 * Minutes since local midnight of an instant in a time zone.
 * @param instant - wall-clock instant.
 * @param timeZone - IANA zone.
 * @returns minutes in `[0, 1440)`.
 */
export function localMinuteOfDay(instant: Date, timeZone: string): number {
  const value = parts(instant, timeZone)
  return Number(value['hour']) * 60 + Number(value['minute'])
}

function toUtcDay(date: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (match === null) throw new RangeError(`invalid calendar date ${date}`)
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86_400_000
}

/**
 * Add whole calendar days.
 * @param date - `YYYY-MM-DD`.
 * @param days - signed day count.
 * @returns the shifted `YYYY-MM-DD`.
 */
export function addDays(date: string, days: number): string {
  return new Date((toUtcDay(date) + days) * 86_400_000).toISOString().slice(0, 10)
}

/**
 * Signed whole days from `from` to `to`.
 * @param from - start date.
 * @param to - end date.
 * @returns `to - from` in days.
 */
export function daysBetween(from: string, to: string): number {
  return Math.round(toUtcDay(to) - toUtcDay(from))
}

/**
 * Validate a calendar date string.
 * @param date - candidate.
 * @returns whether the value is a real `YYYY-MM-DD` date.
 */
export function isCalendarDate(date: string): boolean {
  try {
    return addDays(date, 0) === date
  } catch {
    return false
  }
}
