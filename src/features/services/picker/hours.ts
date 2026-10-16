/* Labour as the workshop counts it, in hours and quarters: 45 -> '0,75', 120 -> '2' */
const number = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 })

export const hoursValue = (minutes: number) => number.format(minutes / 60)

/* 45 -> '0,75 h' */
export const hours = (minutes: number) => `${hoursValue(minutes)} h`

/* What is typed in a stepper, '0,75' or '1.5', in minutes. Null when it is no number */
export const parseHours = (text: string): number | null => {
  const value = parseFloat(text.replace(',', '.'))
  return Number.isFinite(value) ? Math.round(value * 60) : null
}

/* 1 -> '1 artículo', 3 -> '3 artículos' */
export const count = (n: number, singular: string, plural = `${singular}s`) => `${n} ${n === 1 ? singular : plural}`
