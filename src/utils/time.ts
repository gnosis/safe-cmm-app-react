const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Calculates date difference in days. Rounds down.
 *
 * @param a Date A
 * @param b Date B
 */
export function dateDiffInDays(a: Date, b: Date): number {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / MS_PER_DAY);
}
