import { type ChangeEvent } from 'react'
import styles from './TableFilter.module.css'
import { isRange, type RangeFilter, type TableFilterProps} from '@/components/Table/TableFilter/types'
import { titleize } from '@/lib/strings'

const TableFilter = ({ filter={}, dispatchFilterChange, onCloseFilter }: TableFilterProps) => {

  const handleCheckboxValueChanged = (e: ChangeEvent<HTMLInputElement>, column: string, value: string): void => {
    const checkbox = e.currentTarget
    dispatchFilterChange({ type: 'TOGGLE_COLUMN', payload: { column, value, selected: checkbox.checked }})
  }

  const handleRangeValueChanged = (
    e: ChangeEvent<HTMLInputElement>,
    column: string,
    range: RangeFilter,
    target: 'min' | 'max'): void =>
  {

    const input = e.currentTarget

    dispatchFilterChange({
      type: 'SET_COLUMN_RANGE',
      payload: { column, target, value: input.value, parser: range.parser }
    })
  }

  return (
    <div role='dialog' aria-modal="true" aria-label="table filter" className={ styles.filterModal }>
      { filter
        ? Object.entries(filter).map(([column, filterValue]) => {

          return (
            <div key={ column } className={ styles.filterColumnContainer } role='group' aria-label={ column }>
              <div id={`${column}-filter-label`} className={ styles.filterColumnLabel } role='label' >
                { titleize(column) }
              </div>
              { isRange(filterValue)
                ? <div className={ styles.rangesContainer }>
                    <div>
                      <label htmlFor={ `${column}-min` }>
                        Min
                      </label>
                      <input
                        type="text"
                        id={`${column}-min`}
                        className={ styles.rangeInput }
                        name='min'
                        aria-label={ `${column} min` }
                        value={ getRangeLimit(filterValue, 'min') }
                        onChange= { e => handleRangeValueChanged(e, column, filterValue, 'min') }
                      />
                    </div>
                    <div>
                      <label htmlFor={ `${column}-max` }>
                        Max
                      </label>
                      <input
                        type="text"
                        id={`${column}-max`}
                        className={ styles.rangeInput }
                        name='max'
                        aria-label={ `${column} max` }
                        value={ getRangeLimit(filterValue, 'max') }
                        onChange= { e => handleRangeValueChanged(e, column, filterValue, 'max') }
                      />
                    </div>
                  </div>
                : <div className={ styles.checkboxesContainer }>
                    { filterValue.values &&
                      filterValue.values.map((value) =>
                        <label key={ value } className={ styles.filterCheckbox }>
                          <input
                            type='checkbox'
                            name={ value }
                            className={ styles.checkboxInput }
                            checked={ filterValue.checked.includes(value) }
                            onChange={ e => handleCheckboxValueChanged(e, column, value) }
                          />
                          <span className={ styles.checkboxBox } aria-hidden="true"></span>
                          <span className={ styles.checkboxLabel }>
                            { titleize(value) }
                          </span>
                        </label>
                    )}
                  </div>
              }
            </div>
          )})
        : 'No data available'
      }
      <div className={ styles.buttonsContainer }>
        <button className={ `${styles.button} ${styles.resetButton}` } onClick={ () => dispatchFilterChange({ type: 'RESET_FILTER' })}>
          Reset
        </button>
        <button className={ `${styles.button} ${styles.closeButton}` } onClick={ onCloseFilter }>
          Close
        </button>
      </div>
    </div>
  )
}

const getRangeLimit = (range: RangeFilter, limit: 'min'|'max'): string => {
  const rangeLimit = range && range[limit]
  return rangeLimit ? String(rangeLimit) : ''
}

export default TableFilter