import type { Entity } from '@/types.ts'

export type SelectItemPayload<T extends Entity> = { id: T['id'], isSelected: boolean }
export type SelectAllPayload<T extends Entity> = { ids: T['id'][], isSelected: boolean }
export type SelectPayload<T extends Entity> =
  | SelectItemPayload<T>
  | SelectAllPayload<T>

export type SelectionTypes =
  | 'SELECT_ITEM'
  | 'SELECT_ALL'

export type SelectionAction<T extends Entity> =
  | { type: 'SELECT_ITEM', payload: SelectItemPayload<T> }
  | { type: 'SELECT_ALL', payload: SelectAllPayload<T> }

const selectionReducer = <T extends Entity>(selected: T['id'][], action: SelectionAction<T>): T['id'][] => {
  switch (action.type) {
    case 'SELECT_ITEM' :
      return selectItem(selected, action.payload)

    case 'SELECT_ALL' :
      return selectAll(action.payload)

    default :
      throw new Error(`Unknown action type: '${(action as any).type}'`)
  }
}

const selectItem = <T extends Entity>(
  selected: T['id'][],
  payload: SelectItemPayload<T>
): T['id'][] => {

  const { id, isSelected } = payload

  return isSelected
    ? [...selected, id]
    : selected.filter(selectedId => selectedId !== id)
}

const selectAll = <T extends Entity>(payload: SelectAllPayload<T>): T['id'][] => {
  const { ids, isSelected } = payload
  return isSelected ? ids : []
}

export default selectionReducer
