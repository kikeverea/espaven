import type { ApiMapper } from '@/api/apiClient.ts'
import type { Inquiry } from '@/features/inquiries/types.ts'
import { type ForbiddenApiFields, prepareForApi } from '@/api/entity.mapper.ts'

export const mapperFactory = <
  TDomain extends Inquiry, TApiIn, TApiOut extends object & ForbiddenApiFields
>(): ApiMapper<TDomain, TApiIn, TApiOut> =>
{
  return {
    toApi: (inquiry: Partial<TDomain>): TApiOut => {
      const { contact } = inquiry
      const apiAcceptable = prepareForApi(inquiry)

      return {
        ...apiAcceptable,
        contact_attributes: contact
      } as unknown as TApiOut
    }
  }
}