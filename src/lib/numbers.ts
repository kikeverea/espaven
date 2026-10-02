export const toCents = (n: number | undefined): number => (n || 0) * 100.0
export const toDecimal = (cents: number): number => Math.round((cents / 100) * 100) / 100

const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export const formatEuros = (n: number): string => euros.format(n)
