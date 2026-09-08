import { useState } from 'react'
import type { TableSort } from '@/components/Table/types'

export type TableQuery = {
  page: number
  perPage: number
  search: string
  sort?: TableSort
  setPage: (page: number) => void
  setPerPage: (perPage: number) => void
  setSearch: (search: string) => void
  setSort: (sort: TableSort) => void
}

/*
 * State for collections the api slices and sorts. Feed it to the feature query hook
 * (it belongs in the query key) and hand the setters to the Table
 */
const useTableQuery = (initialPerPage: number = 25, initialSort?: TableSort): TableQuery => {
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(initialPerPage)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(initialSort)

  // a different page size, order or search term makes the current page meaningless
  const backToFirstPage = <T,>(apply: (value: T) => void) => (value: T) => {
    apply(value)
    setPage(1)
  }

  return {
    page,
    perPage,
    search,
    sort,
    setPage,
    setPerPage: backToFirstPage(setPerPage),
    setSearch: backToFirstPage(setSearch),
    setSort: backToFirstPage(setSort),
  }
}

export default useTableQuery
