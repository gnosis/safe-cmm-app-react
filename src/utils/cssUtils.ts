/**
 * Converts cssUnits to string.
 *
 * If number, assumes px and appends `px`.
 * Otherwise return as is.
 *
 * @param cssUnits Number or string representing css units.
 */
export function pxOrCustomCssUnits(cssUnits?: string | number): string {
  if (typeof cssUnits === "string") {
    return cssUnits;
  } else if (typeof cssUnits === "number") {
    return `${cssUnits}px`;
  }
  return "";
}
