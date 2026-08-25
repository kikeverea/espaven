import {screen, within} from '@testing-library/react'
import type { Dictionary, Entity } from '@/types.ts'
import type { TableData } from '@/components/Table/types.ts'
import { normalized } from '@/lib/strings.ts'
import type { FilterColumns } from '@/components/Table/TableToolbar/types.ts'
import { buildFilter } from '@/components/Table/TableToolbar/filterBuilder.ts'
import type { CheckboxesFilter, RangeFilter, TableFilter } from '@/components/Table/TableFilter/types.ts'

export type TestData = Entity & {
  name: string,
  family: string,
  type: string,
  age: number,
  birth: string,
}

export type UpdateFilterArgs = Dictionary<string[] | { min?: number | string, max?: number | string, parser?: any }>

export const formatDate = (dateMillis: number): string => {
  const date = new Date(dateMillis as number)
  return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
}

export const parseDate = (date: string): number => {
  return new Date(date).getTime()
}

export const parseUserInputDate = (date: string): number | null => {
  if (!date)
    return null

  const [day, month, year] = date.split('-')

  const validDate =
    year && month && day &&
    year.length === 4 &&
    month.length >= 1 &&
    day.length >= 1

  return validDate ? parseDate(`${year}-${month}-${day}`) : null
}

export const getTestData = ({ collection, row, col }: { collection: TestData[], row: number, col: number }) => {

  const data = collection[row]

  switch (col) {
    case 0 :
      return String(data.name)

    case 1 :
      return String(data.family)

    case 2 :
      return String(data.type)

    case 3 :
      return String(data.age)

    case 4 :
      return formatDate(parseDate(data.birth))
  }
}

export const dataRows = () => {
  return screen.getAllByRole('row').slice(1)    // rows excluding the header row
}

export const getNameCellsContent = (rows: HTMLElement[]=dataRows()) => {
  const nameCellIndex = 0

  return rows.map(row =>
    within(row).getAllByRole('cell')[nameCellIndex].textContent)
}

export const names = (data: TableData): string[] => data.map(item => item.data['name'].value as string)

export const get = (collection: TestData[], ...names: string[]): string[] => {
  return names.reduce((items, name) => {
      const item = collection.find(item => normalized(item.name) === normalized(name))

      if (!item)
        throw new Error(`Test error!: No item found with name'${name}'`)

      return item ? [ ...items, item.name ] : items
    },
    [] as string[])
}

export const newFilter = (columns: FilterColumns, args?: UpdateFilterArgs, collection: TestData[] = defaultCollection): TableFilter => {

  const filter = buildFilter({ columns, collection })

  if (!args)
    return filter

  for (const [name, params] of Object.entries(args)) {

    const col = filter[name.toLowerCase()]

    if (!col)
      continue

    const isCheckboxes = !('min' in params) && !('max' in params)

    if (isCheckboxes) {
      const checkboxes = col as CheckboxesFilter
      const checked = params as string[]

      for (const checkboxName of checked) {
        checkboxes.checked.push(checkboxName)
      }
    }
    else {
      const range = col as RangeFilter
      const { min, max, parser } = params as { min: number, max: number, parser: any }

      range.min = min
      range.max = max
      range.parser = parser
    }
  }

  return filter
}

export const defaultCollection: TestData[] = [
  { id: 1, name: 'Cat', family: 'Feline', type: 'Pet', age: 10, birth: '2015-07-14' },
  { id: 2, name: 'Dog', family: 'Canine', type: 'Pet', age: 5, birth: '2020-07-14' },
  { id: 3, name: 'Lion', family: 'Feline', type: 'Wild', age: 13, birth: '2012-07-14' },
  { id: 4, name: 'Sea Lion', family: 'Seals', type: 'Wild', age: 16, birth: '2009-07-14' },
  { id: 5, name: 'Red Fox', family: 'Canine', type: 'Wild', age: 6, birth: '2019-03-22' },
  { id: 6, name: 'Gold Fish', family: 'Fish', type: 'Pet', age: 3, birth: '2022-11-16' },
  { id: 7, name: 'Monkey', family: 'Primate', type: 'Wild', age: 5, birth: '2020-01-08' },
]

export const defaultFilterColumns: FilterColumns = [ 'Family', 'Type', ['Age', 'range'], ['Birth', 'range', parseDate] ]