import { BATCH_TIME } from "@gnosis.pm/dex-js";

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

export const simpleIsDateCheck = (
  date?: Date | string | number | null
): number =>
  !date
    ? Date.now()
    : typeof date === "string" || typeof date === "number"
    ? +date
    : date.getTime();

/**
 * Calculates the batchId. Either current batchId based on current Epoch
 * or calculated if given a date
 *
 * Keep in mind this is used mainly for generating test data.
 * The contract's `getBatchId` should be the source of truth.
 *
 * @param date? Optional Date object to calculate the batchId from.
 *  Defaults to Date.now()
 */
export function dateToBatchId(date?: Date | string | number | null): number {
  const timestamp = simpleIsDateCheck(date);
  const timestampInSeconds = Math.floor(timestamp / 1000);
  return Math.floor(timestampInSeconds / BATCH_TIME);
}

export function batchIdToDate(batchId: number): Date {
  const timestamp = batchId * BATCH_TIME * 1000;
  return new Date(timestamp);
}
