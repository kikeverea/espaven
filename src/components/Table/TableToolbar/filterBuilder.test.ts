import {buildFilter, resetFilter} from './filterBuilder.ts'
import type { FilterColumns } from '@/components/Table/TableToolbar/types.ts'
import type { TestData } from '@/lib/testUtils.ts'
import type { TableFilter } from '@/components/Table/TableFilter/types.ts'

const parser = (value: any) => value

const columns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parser] ]

const collection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

const initialFilter: TableFilter = {
  'family': {
    values: [ 'feline', 'canine', 'seals', 'fish', 'primate' ],
    checked: [],
    type: 'checkboxes'
  },
  'type': {
    values: [ 'pet', 'wild' ],
    checked: [],
    type: 'checkboxes'
  },
  'age': {
    type: 'range'
  },
  'birth': {
    type: 'range',
    parser
  }
}

test('creates a correct filter structure', () => {

  const filter = buildFilter({ columns, collection })

  expect(Object.keys(filter)).toHaveLength(Object.keys(initialFilter).length)
  expect(filter).toEqual(initialFilter)
})

test('resets a filter to its initial structure', () => {

  const filter: TableFilter = {
    'family': {
      values: [ 'feline', 'canine', 'seals', 'fish', 'primate' ],
      checked: [ 'feline', 'fish', 'primate' ],
      type: 'checkboxes'
    },
    'type': {
      values: [ 'pet', 'wild' ],
      checked: [ 'pet', 'wild' ],
      type: 'checkboxes'
    },
    'age': {
      min: 5,
      max: 16,
      type: 'range'
    },
    'birth': {
      min: '2025-12-25',
      type: 'range',
      parser
    }}

  const reset = resetFilter(filter)
  expect(reset).toEqual(initialFilter)
})
