import type { Dispatch } from 'react'
import { useState } from 'react'

const usePagination = (perPage: number | undefined, currentPage: number):
  readonly [{ page: number, itemsPerPage: number } | undefined, Dispatch<number>, Dispatch<number>] =>
{

  const [itemsPerPage, setItemsPerPage] = useState(perPage)
  const [page, setPage] = useState(currentPage)

  const pagination = itemsPerPage !== undefined
    ? { page, itemsPerPage }
    : undefined

  return [pagination, setItemsPerPage, setPage]
}

export default usePagination