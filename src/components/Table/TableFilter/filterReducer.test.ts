import type { UpdateFilterArgs } from '@/lib/testUtils'
import type { TableFilter } from '@/components/Table/TableFilter/types'
import type { FilterColumns } from '@/components/Table/TableToolbar/types'

import filterReducer from './filterReducer.ts'
import { parseDate, newFilter } from '@/lib/testUtils'

describe('filterReducer', () => {

  const filterColumns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parseDate] ]
  let filterAnd: (args?: UpdateFilterArgs) => TableFilter
  let filter: () => TableFilter

  beforeEach(() => {
    filterAnd = (args?: UpdateFilterArgs) => newFilter(filterColumns, args)
    filter = () => newFilter(filterColumns)
  })

  describe('toggle column', () => {
    test('selecting a column value adds the column and value to the filter', () => {
      const state = filterReducer(
        filter(),
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Feline', selected: true }}
      )
      expect(state).toEqual(filterAnd({ family: ['feline'] }))
    })

    test('selecting a column value of a column already present in the filter, adds the value to the filter', () => {
      const state = filterReducer(
        filterAnd({ family: ['feline'] }),
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'canine', selected: true }}
      )
      expect(state).toEqual(filterAnd({ family: ['feline', 'canine'] }))
    })

    test('unselecting a column value removes the value from the filter', () => {
      const state = filterReducer(
        filterAnd({ family: ['feline', 'canine'] }),
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'canine', selected: false }}
      )
      expect(state).toEqual(filterAnd({ family: ['feline'] }))
    })

    test('unselecting the last value of a column produces an empty array', () => {
      const state = filterReducer(
        filterAnd({ family: ['feline'] }),
        { type: 'TOGGLE_COLUMN', payload: { column: 'Family', value: 'Feline', selected: false }}
      )
      expect(state).toEqual(filterAnd({ family: [] }))
    })
  })

  describe('filter range', () => {
    test.each([10, '10'])('sets a range min', min => {
      const state = filterReducer(
        filter(),
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', target: 'min', value: min }}
      )
      expect(state).toEqual(filterAnd({ age: { min: min }}))
    })

    test.each([12, '12'])('sets a range max', max => {
      const state = filterReducer(
        filter(),
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', target: 'max', value: max }}
      )
      expect(state).toEqual(filterAnd({ age: { max: max, parser: undefined }}))
    })

    test('sets a range min and max', () => {
      const minState = filterReducer(
        filter(),
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', target: 'min', value: 10 }}
      )

      const minMaxState = filterReducer(
        minState,
        { type: 'SET_COLUMN_RANGE', payload: { column: 'Age', target: 'max', value: 16 }}
      )

      expect(minMaxState).toEqual(filterAnd({ age: { min: 10, max: 16 }}))
    })
  })

  test('reset filter', () => {
    const state = filterReducer(
      filterAnd({ family: ['feline', 'canine'], age: { min: '10', max: '12' }}),
      { type: 'RESET_FILTER' }
    )
    expect(state).toEqual(filter())
  })
})



