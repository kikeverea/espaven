import type { Dispatch } from 'react'
import { useState } from 'react'

/* What the Table pages through on its own. Zero indexed, unlike the api's Pagination */
export type ClientPagination = {
  page: number
  itemsPerPage: number
}

type PaginationState = readonly [ClientPagination | undefined, Dispatch<number>, Dispatch<number>]

const usePagination = (perPage: number | undefined, currentPage: number): PaginationState => {

  const [itemsPerPage, setItemsPerPage] = useState(perPage)
  const [page, setPage] = useState(currentPage)

  const pagination = itemsPerPage !== undefined
    ? { page, itemsPerPage }
    : undefined

  return [pagination, setItemsPerPage, setPage]
}

export default usePagination
