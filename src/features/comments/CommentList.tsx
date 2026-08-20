import { Card, CardContent } from '@/components/ui/card.tsx'
import { type Comment } from '@/features/types.ts'

type CommentListProps = {
  comments: Comment[],
  showEmptyMessage?: boolean,
}

const CommentList = ({ comments, showEmptyMessage=true }: CommentListProps) => {
  return comments?.length
    ? comments.map(comment =>
      <Card
        key={ comment.id }
        className={`my-4 w-full xl:w-1/2 pt-0 min-h-0 transition-[padding,box-shadow] duration-300`}
      >
        <CardContent>
          { comment.body }
        </CardContent>
      </Card>
    )
    : showEmptyMessage &&
      <span className='text-muted-foreground text-xs italic'>
        No hay comentarios
      </span>
}

export default CommentList