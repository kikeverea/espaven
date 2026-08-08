import TableFilter from '../TableFilter/TableFilter.tsx'
import { useState } from 'react'
import styles from './TableToolbar.module.css'
import {
  Search as SearchIcon,
  Funnel as FilterIcon
} from 'lucide-react'
import type { TableToolbarProps } from '@/components/Table/TableToolbar/types.ts'

const TableToolbar = (
{
  filter,
  showSearch=true,
  searchPlaceholder,
  onSearchChange=() => {},
  dispatchFilterChange=() => {},
}: TableToolbarProps) => {

  const [showFilter, setShowFilter] = useState<boolean>(false)

  return (
    <div className={ styles.toolbar }>
      { showSearch &&
        <div className={ styles.searchbarContainer }>
          <input
            type='text'
            className={ styles.searchbar }
            onChange={ e => onSearchChange(e.currentTarget.value) }
            aria-label='table search'
            placeholder={ searchPlaceholder || 'Search' }
          />
          <SearchIcon className={ styles.searchbarIcon } />
        </div>
      }
      { filter &&
        <div className={ styles.filterContainer }>
          { showFilter &&
            <div className={styles.filter}>
              <TableFilter
                filter={ filter }
                dispatchFilterChange={ dispatchFilterChange }
                onCloseFilter={ () => setShowFilter(false) }
              />
            </div>
          }

          <button
            className={ styles.filterButton }
            aria-label='show filter'
            onClick={ () => setShowFilter(!showFilter)}
          >
            <FilterIcon className={ styles.filterButtonIcon }/> <span className={ styles.filterButtonLabel }>Filter</span>
          </button>
        </div>
      }
    </div>
  )
}

export default TableToolbar