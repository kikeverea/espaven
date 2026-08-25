import { Card, CardContent } from '@/components/ui/card.tsx'
import { type Comment } from '@/features/inquiries/types.ts'
import Avatar from '@/components/Avatar/Avatar.tsx'

type CommentListProps = {
  comments: Comment[],
  showEmptyMessage?: boolean,
}

const CommentList = ({ comments, showEmptyMessage=true }: CommentListProps) => {
  return comments?.length
    ? comments.map(comment =>
      <Card
        key={ comment.id }
        className={`my-4 w-full min-h-0 transition-[padding,box-shadow] duration-300`}
      >
        <CardContent className='text-[13px] '>
          <div className='flex gap-3 items-start'>
            <Avatar name={ comment.createdBy.fullName } variant='circle' size='sm' className='mt-1'/>
            { comment.body }
          </div>
        </CardContent>
      </Card>
    )
    : showEmptyMessage &&
      <span className='text-muted-foreground text-xs italic'>
        No hay comentarios
      </span>
}

export default CommentList