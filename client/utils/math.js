const maxPrecision = 6
export function round(num, precision = maxPrecision) {
  const base = 10
  return Math.round(num * base ** precision) / base ** precision
}
