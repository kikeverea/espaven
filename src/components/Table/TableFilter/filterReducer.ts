import {
  type ColumnTogglePayload, type FilterAction, type RangeValuePayload, type TableFilter,
  assertAsCheckboxes,
  assertAsRange,
} from '@/components/Table/TableFilter/types'

import { resetFilter } from '../TableToolbar/filterBuilder'
import { normalized } from '@/lib/strings'

const filterReducer = (filter: TableFilter, action: FilterAction) : TableFilter  => {
  switch (action.type) {
    case 'TOGGLE_COLUMN' :
      const updatedFilter = toggleColumn(filter, action.payload)
      return { ...updatedFilter }

    case 'SET_COLUMN_RANGE' :
      const updatedRange = setRangeLimit(filter, action.payload)
      return { ...updatedRange }

    case 'RESET_FILTER' :
      return { ... resetFilter(filter) }

    default :
      throw new Error(`Unknown action type: '${(action as any).type}'`)
  }
}

const toggleColumn = (filter: TableFilter, payload: ColumnTogglePayload): TableFilter => {

  const { column, value, selected } = payload

  const columnName = normalized(column)
  const checkboxFilter = filter[columnName]

  assertAsCheckboxes(checkboxFilter)

  const checked = checkboxFilter.checked
  const valueName = normalized(value)

  const updatedValues = selected
    ? [ ...checked, valueName ]
    : checked.filter(name => name !== valueName)

  return { ...filter, [columnName]: { ...checkboxFilter, checked: updatedValues }}
}

const setRangeLimit = (filter: TableFilter, payload: RangeValuePayload): TableFilter => {
  const { column, target, value } = payload

  const columnName = normalized(column)
  const rangeValue = filter[columnName] || {}

  assertAsRange(rangeValue)

  const newRangeValue = { ...rangeValue, [target]: value }

  return { ...filter, [columnName]: newRangeValue }
}

export default filterReducer