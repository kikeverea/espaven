import { describe, expect } from 'vitest'
import { camelize } from '@/lib/strings.ts'

describe('strings', () => {

  test('camelizes underscore', () => {
    expect(camelize('this_is_underscored')).toBe('thisIsUnderscored')
  })

  test('camelizes dashed', () => {
    expect(camelize('this-is-dashed')).toBe('thisIsDashed')
  })

  test('camelizes spaced', () => {
    expect(camelize('this is spaced')).toBe('thisIsSpaced')
  })

  test('camelizes mixed', () => {
    expect(camelize('this_is_Mixed string')).toBe('thisIsMixedString')
  })
})