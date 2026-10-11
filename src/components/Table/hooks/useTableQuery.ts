import { useState } from 'react'
import type { TableQuery, TableQueryState } from '@/components/Table/types'
import { DEFAULT_PER_PAGE } from '@/components/Table/TablePaginator/TablePaginator'

/* The mode, and the state the query starts from */
export type TableQueryOptions = Partial<TableQueryState> & { mode?: TableQuery['mode'] }

/*
 * The state a Table narrows its collection with. A 'server' one belongs in the feature query hook
 * (and so in its query key), a 'local' one only changes what the Table shows of what it holds
 */
const useTableQuery = ({ mode = 'local', ...initial }: TableQueryOptions = {}): TableQuery => {

  const [page, setPage] = useState(initial.page ?? 1)
  const [perPage, setPerPage] = useState(initial.perPage ?? DEFAULT_PER_PAGE)
  const [search, setSearch] = useState(initial.search ?? '')
  const [sort, setSort] = useState(initial.sort)
  const [filter, setFilter] = useState(initial.filter ?? {})

  // a different page size, order, search or filter makes the current page meaningless
  const backToFirstPage = <T,>(apply: (value: T) => void) => (value: T) => {
    apply(value)
    setPage(1)
  }

  return {
    mode,
    page,
    perPage,
    search,
    sort,
    filter,
    setPage,
    setPerPage: backToFirstPage(setPerPage),
    setSearch: backToFirstPage(setSearch),
    setSort: backToFirstPage(setSort),
    setFilter: backToFirstPage(setFilter),
  }
}

export default useTableQuery
