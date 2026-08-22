import type { ApiMapper } from '@/api/apiClient.ts'
import { type ForbiddenApiFields } from '@/api/entity.mapper.ts'
import type { Entity } from '@/types.ts'

export const mapperFactory = <
  TDomain extends Entity, TApiIn, TApiOut extends object & ForbiddenApiFields>
  (mapper: ApiMapper<TDomain, TApiIn, TApiOut>):
  ApiMapper<TDomain, TApiIn, TApiOut> =>
  mapper