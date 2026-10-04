import { collectionParams, type CollectionQuery } from '@/api/apiClient.ts'
import { withParams } from '@/lib/urls.ts'

export const collectionQuery = (query?: CollectionQuery): string =>
  withParams('', collectionParams(query))