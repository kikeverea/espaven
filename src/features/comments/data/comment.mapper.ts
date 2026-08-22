import { prepareForApi } from '@/api/entity.mapper'
import { mapperFactory } from '@/features/comments/data/mapper.factory'
import { type EntityKeys, isEntity } from '@/types'
import type { Comment } from '@/features/inquiries/types'

type ApiComment<T> = T & { commentable?: object }

export default <
  T extends Comment, API extends ApiComment<T> = T>
  (commentable_name: EntityKeys<T>) => mapperFactory(
{
  toApi: (comment: Partial<T>) => {
    const apiAcceptable = prepareForApi(comment)

    const commentable = comment[commentable_name]

    if (!commentable || !isEntity(commentable))
      throw Error(`Comment must have a commentable (${String(commentable_name)})`)

    return {
      ...apiAcceptable,
      commentable_id: commentable.id
    }
  },
  fromApi: (comment: Partial<API>) => {
    return {
      ...comment,
      [commentable_name]: comment.commentable
    } as unknown as T
  }
})