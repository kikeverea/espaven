import { describe, expect } from 'vitest'
import { camelize, snakeCase } from '@/lib/strings.ts'

describe('strings', () => {

  describe('camelize', () => {
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

  describe('snake case', () => {
    test('snake case camel', () => {
      expect(snakeCase('thisIsUnderscored')).toBe('this_is_underscored')
    })

    test('snake case dashed', () => {
      expect(snakeCase('this-is-dashed')).toBe('this_is_dashed')
    })

    test('snake case spaced', () => {
      expect(snakeCase('this is spaced')).toBe('this_is_spaced')
    })

    test('snake case mixed', () => {
      expect(snakeCase('this_is_Mixed string')).toBe('this_is_mixed')
    })
  })

})