import selectionReducer from './selectionReducer'

describe('selectionReducer', () => {

  describe('select item', () => {
    test('selecting an item adds its id to the selection', () => {
      const state = selectionReducer([], { type: 'SELECT_ITEM', payload: { id: 1, selected: true } })
      expect(state).toEqual([1])
    })

    test('selecting an item adds its id to an existing selection', () => {
      const state = selectionReducer([1], { type: 'SELECT_ITEM', payload: { id: 2, selected: true } })
      expect(state).toEqual([1, 2])
    })

    test('unselecting an item removes its id from the selection', () => {
      const state = selectionReducer([1, 2], { type: 'SELECT_ITEM', payload: { id: 2, selected: false } })
      expect(state).toEqual([1])
    })

    test('unselecting the last id produces an empty selection', () => {
      const state = selectionReducer([1], { type: 'SELECT_ITEM', payload: { id: 1, selected: false } })
      expect(state).toEqual([])
    })
  })

  describe('select all', () => {
    test('selecting all sets the selection to the given ids', () => {
      const state = selectionReducer([], { type: 'SELECT_ALL', payload: { ids: [1, 2, 3], selected: true } })
      expect(state).toEqual([1, 2, 3])
    })

    test('selecting all replaces any existing selection', () => {
      const state = selectionReducer([4], { type: 'SELECT_ALL', payload: { ids: [1, 2, 3], selected: true } })
      expect(state).toEqual([1, 2, 3])
    })

    test('unselecting all empties the selection', () => {
      const state = selectionReducer([1, 2, 3], { type: 'SELECT_ALL', payload: { ids: [1, 2, 3], selected: false } })
      expect(state).toEqual([])
    })
  })

  test('throws on an unknown action type', () => {
    expect(() => selectionReducer([], { type: 'UNKNOWN' } as any)).toThrow(/Unknown action type/)
  })
})
