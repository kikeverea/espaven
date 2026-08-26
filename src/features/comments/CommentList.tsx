import Comment from '@/features/comments/Comment'
import { type Comment as CommentType } from '@/features/comments/types'

type CommentListProps = {
  comments: CommentType[],
  showEmptyMessage?: boolean,
}

const CommentList = ({ comments, showEmptyMessage=true }: CommentListProps) => {
  return comments?.length
    ? <div className='d-flex flex-col gap-4 mt-3.5 mb-4'>
        {comments.map(comment => <Comment comment={comment} />)}
      </div>
    : showEmptyMessage &&
      <span className='text-muted-foreground text-xs italic'>
        No hay comentarios
      </span>
}

export default CommentList