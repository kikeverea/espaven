import * as z from 'zod'
import { config } from '@/features/services/data/service.form'
import { extractSchema } from '@/components/Form/util'
import { formatEuros } from '@/lib/numbers'

const formSchema = extractSchema(config(25.25))

describe('serviceFormSchema', () => {

  test('accepts a valid service', () => {
    const result = formSchema.safeParse(service())
    expect(result.success).toBe(true)
  })

  it.each([
    'name',
    'standardLaborTime',
    'laborMinutes',
  ])('rejects if %s not present', field => {
    const result = formSchema.safeParse(service({ [field]: null }))
    expect(result.success).toBe(false)
  })

  it.each([
    'name',
  ])('rejects if %s length less than min length, passes if not', field => {
    const invalid = formSchema.safeParse(service({ [field]: '1' }))
    const valid = formSchema.safeParse(service({ [field]: '11' }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    [ 'name', 148 ],
  ])('rejects if %s length more than max length, passes if not', (field, maxLength) => {
    const valid = formSchema.safeParse(service({ [field]: '1'.repeat(maxLength) }))
    const invalid = formSchema.safeParse(service({ [field]: '1'.repeat(maxLength + 1) }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([
    [ 'standardLaborTime', 0 ],
    [ 'laborMinutes', 0 ],
  ])('rejects if %s is less than minimum, passes if not', (field, min) => {
    const valid = formSchema.safeParse(service({ [field]: min }))
    const invalid = formSchema.safeParse(service({ [field]: min - 1 }))

    expect(valid.success).toBe(true)
    expect(invalid.success).toBe(false)
  })

  it.each([ 0.25, 1.5, 8 ])('accepts a standard labor time of %s h, in quarters of an hour', hours => {
    expect(formSchema.safeParse(service({ standardLaborTime: hours })).success).toBe(true)
  })

  it.each([ 0.3, 1.1 ])('rejects a standard labor time of %s h, not in quarters of an hour', hours => {
    const result = formSchema.safeParse(service({ standardLaborTime: hours }))

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Debe ser en intervalos de 0,25 h')
  })
})

describe('standardLaborTime feedback', () => {

  /* 25.25 € a minute */
  const { feedback } = config(25.25).fields.standardLaborTime

  it.each([
    [ '0.25', 15 * 25.25 ],
    [ '1.5', 90 * 25.25 ],
  ])('prices %s h at the minute rate', (hours, price) => {
    expect(feedback(hours)).toBe(`Precio: ${formatEuros(price)}`)
  })

  test('shows nothing while the field is blank', () => {
    expect(feedback('')).toBeNull()
  })
})

describe('standardLaborTime and laborMinutes', () => {

  const { standardLaborTime, laborMinutes } = config(25.25).fields

  it.each([
    [ '0.25', 15 ],
    [ '1.5', 90 ],
    [ '', '' ],
  ])('setting %s h sets the minutes to %s', (hours, minutes) => {
    const set = vi.fn()
    standardLaborTime.onChange(hours, set)

    expect(set).toHaveBeenCalledWith('laborMinutes', minutes)
  })

  it.each([
    [ '90', 1.5 ],
    [ '50', 50 / 60 ],
    [ '', '' ],
  ])('setting %s min sets the hours to %s, exactly', (minutes, hours) => {
    const set = vi.fn()
    laborMinutes.onChange(minutes, set)

    expect(set).toHaveBeenCalledWith('standardLaborTime', hours)
  })
})

const service = (customFields: Partial<z.infer<typeof formSchema>> = {}) => {
  return { name: 'Service 1', standardLaborTime: 1, laborMinutes: 60, ...customFields }
}
