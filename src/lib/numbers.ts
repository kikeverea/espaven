export const toCents = (n: number | undefined): number => (n || 0) * 100.0
export const toDecimal = (cents: number): number => Math.round((cents / 100) * 100) / 100