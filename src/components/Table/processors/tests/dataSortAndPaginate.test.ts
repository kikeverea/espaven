import type { TableColumn, TableSort } from '@/components/Table/types'
import type {TestData } from '@/lib/testUtils'

import { sortAndPaginateData } from '../dataSortAndPaginate.ts'
import { formatDate, get, names, parseDate } from '@/lib/testUtils'
import { mapToData } from '../dataProcessor.ts'

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


describe('Sort and Pagination', () => {

  describe('Pagination', () => {
    test('paginates data', () => {
      const data = sortAndPaginateData(collection, { pagination: { itemsPerPage: 2 } })
      expect(names(data)).toEqual(get(raw, 'Cat', 'Dog'))
    })

    test('return selected page data', async () => {
      const data = sortAndPaginateData(collection, { pagination: { itemsPerPage: 2, page: 1} })
      expect(names(data)).toEqual(get(raw, 'Lion', 'Sea Lion'))
    })
  })

  describe('Sorting', () => {
    test('sorts collection ascending', () => {
      const sort = { column: 'family' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Dog', 'Red Fox', 'Cat', 'Lion', 'Gold Fish', 'Monkey', 'Sea Lion' ))
    })

    test('sorts collection descending', () => {
      const sort: TableSort = { column: 'family', direction: 'desc' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Sea Lion', 'Monkey', 'Gold Fish', 'Cat', 'Lion', 'Dog', 'Red Fox'))
    })

    test('sorts by number asc', () => {
      const sort: TableSort = { column: 'age' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Gold Fish', 'Dog', 'Monkey', 'Red Fox', 'Cat', 'Lion', 'Sea Lion'))
    })

    test('sorts by number desc', () => {
      const sort: TableSort = { column: 'age', direction: 'desc' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Sea Lion', 'Lion', 'Cat', 'Red Fox', 'Dog', 'Monkey', 'Gold Fish'))
    })

    test('sorts by date asc', () => {
      const sort: TableSort = { column: 'birth' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Sea Lion', 'Lion', 'Cat', 'Red Fox', 'Monkey', 'Dog', 'Gold Fish'))
    })

    test('sorts by date desc', () => {
      const sort: TableSort = { column: 'birth', direction: 'desc' }

      const data = sortAndPaginateData(collection, { sort })
      expect(names(data)).toEqual(get(raw, 'Gold Fish', 'Dog', 'Monkey', 'Red Fox', 'Cat', 'Lion', 'Sea Lion'))
    })
  })
})


