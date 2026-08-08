import type { TestData, UpdateFilterArgs } from '@/lib/testUtils'
import { formatDate, get, names, parseDate, newFilter } from '@/lib/testUtils'
import { filterData, mapToData} from '../dataProcessor.ts'
import type { TableColumn } from '@/components/Table/types.ts'
import type { FilterColumns } from '@/components/Table/TableToolbar/types.ts'
import type { TableFilter } from '@/components/Table/TableFilter/types.ts'

const raw: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

const columns: TableColumn<TestData>[] = [
  { name: 'Name', accessor: item => item.name },
  { name: 'Family', accessor: item => item.family },
  { name: 'Type', accessor: item => item.type },
  { name: 'Age', accessor: item => item.age },
  { name: 'Birth', accessor: item => parseDate(item.birth), presenter: formatDate },
]


const collection = mapToData(raw, columns)
const filterColumns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parseDate] ]

describe('Data filter and search', () => {

  describe('Search', () => {

    test('return an item that passes the search', () => {
      const data  = filterData(collection, { search: 'dog' })
      expect(names(data)).toEqual(get(raw, 'Dog'))
    })

    test('return multiple items if they pass the search', () => {
      const data = filterData(collection, { search: 'lion' })
      expect(names(data)).toEqual(get(raw, 'Lion', 'Sea Lion'))
    })

    test('return empty array if no items pass the test', () => {
      const data = filterData(collection, { search: 'no-go' })
      expect(names(data)).toHaveLength(0)
    })
  })

  describe('Filter', () => {

    let toFilter: (args: UpdateFilterArgs) => TableFilter

    beforeEach(() => {
      toFilter = (args: UpdateFilterArgs) => newFilter(filterColumns, args, raw)
    })

    test('return items that pass the filter', () => {
      const filter = toFilter({ 'Family': ['feline', 'canine'], 'Type': ['wild'] })

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Lion', 'Red Fox'))
    })

    test('return empty array if no item passes the filter', () => {
      const filter = toFilter({'Family': ['fish'], 'Type': ['wild'] })

      const data = filterData(collection, { filter })
      expect(names(data)).toHaveLength(0)
    })

    test('return items that pass the range filter', () => {
      const filter: TableFilter = toFilter({ 'Age': { min: 8, max: 15 } })

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Cat', 'Lion'))
    })

    test('return items that pass the range filter, edge cases', () => {
      const filter = toFilter({ 'Age': { min: 10, max: 13 } })

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Cat', 'Lion'))
    })

    test('return items that pass a min range filter', () => {
      const filter = toFilter({ 'Age': { min: 12 } })

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Lion', 'Sea Lion'))
    })

    test('return empty array if no item passes the range filter', () => {
      const filter = toFilter({ 'Age': { min: 13, max: 10 } })

      const data = filterData(collection, { filter })
      expect(names(data)).toHaveLength(0)
    })

    test('return items that pass the max range filter', () => {
      const filter = toFilter({ 'Age': { max: 12 } })

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Cat', 'Dog', 'Red Fox', 'Gold Fish', 'Monkey'))
    })

    test('return items that pass a parsed range filter', () => {
      const filter = toFilter({
        'Birth': {
            min: '2012-07-14',
            max: '2015-07-14',
            parser: (date: string) => new Date(date).getTime()
        }})

      const data = filterData(collection, { filter })
      expect(names(data)).toEqual(get(raw, 'Cat', 'Lion'))
    })

    test('return items that pass a range filter, filter and search', () => {
      const filter = toFilter({ 'Age': { min: 8, max: 16 }, 'Family': ['feline'] })
      const search = 'Lion'

      const data = filterData(collection, { filter, search })

      expect(names(data)).toEqual(get(raw, 'Lion'))
    })
  })
})