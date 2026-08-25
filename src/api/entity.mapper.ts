import type { Record } from '@/types.ts'

export type ForbiddenApiFields = {
  id?: never
  createdAt?: never
}

export const prepareForApi = <
  TDomain extends Record, TApiOut extends object & ForbiddenApiFields>(domain: Partial<TDomain>): TApiOut =>
{
  const { id, createdAt, ...rest } = domain
  return { ...rest } as TApiOut
}