import type { FilterColumns, RangeFilterColumn } from '@/components/Table/TableToolbar/types'
import type { Dictionary } from '@/types.ts'
import {
  type CheckboxesFilter,
  type FilterParser,
  isRange,
  type RangeFilter,
  type TableFilter
} from '@/components/Table/TableFilter/types.ts'
import { normalized } from '@/lib/strings.ts'


type BuildArgs = {
  columns: FilterColumns;
  collection: Dictionary<string | number>[];
};


export const buildFilter = ({ columns, collection }: BuildArgs): TableFilter => {

  return columns.reduce((filter: TableFilter, column): TableFilter => {

    if (isRangeColumn(column)) {
      const [name, _range, parser] = column
      filter[normalized(name)] = buildRangeFilter(parser)
    }
    else {
      filter[normalized(column)] = buildCheckboxesFilterWithCollection(column, collection)
    }

    return filter
  }, {})
}

const buildRangeFilter = (parser?: FilterParser): RangeFilter => {
  return {
    type: 'range',
    ...(parser ? { parser } : {})
  }
}

const buildCheckboxesFilterWithCollection = (column: string, collection: Dictionary<string|number>[]): CheckboxesFilter => {

  const values = collection.reduce((checkboxes, entity): Set<string> => {
    const value = entity[normalized(column)]

    if (value) {
      checkboxes.add(normalized(String(value)))
    }
    else
      console.warn(`Could not find column ${column}. Available columns: ${Object.keys(entity).join(', ')}`)

    return checkboxes
  },
  new Set<string>)

  return checkboxesFilter(Array.from(values))
}

const checkboxesFilter = (values: string[]): CheckboxesFilter => {
  return {
    type: 'checkboxes',
    values: values,
    checked: []
  }
}

const isRangeColumn = (column: string | any[]): column is RangeFilterColumn =>
  Array.isArray(column) && column[1] === 'range'

export const resetFilter = (filter: TableFilter): TableFilter => {

  return Object.entries(filter).reduce((filter: TableFilter, [column, columnFilter]): TableFilter => {

    if (isRange(columnFilter)) {
      filter[normalized(column)] = buildRangeFilter(columnFilter.parser)
    }
    else {
      filter[normalized(column)] = checkboxesFilter(columnFilter.values)
    }

    return filter
  }, {})
}