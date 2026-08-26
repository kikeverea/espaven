import { type Comment as CommentType } from '@/features/comments/types'
import { Card, CardContent } from '@/components/ui/card.tsx'
import Avatar from '@/components/Avatar/Avatar.tsx'
import { timeString } from '@/lib/strings.ts'

const Comment = ({ comment }: { comment: CommentType }) => {

  return (
    <div>
      <Card
        key={ comment.id }
        className={`w-full min-h-0 transition-[padding,box-shadow] duration-300`}
      >
        <CardContent className='text-[13px] ps-3'>
          <div className='flex gap-3 items-start'>
            <Avatar name={ comment.createdBy?.fullName || "?" } variant='circle' size='sm' className='mt-1'/>
            { comment.body }
          </div>
        </CardContent>
      </Card>
      <div className='text-muted-foreground italic text-xs text-end mt-1 me-1'>
        { timeString(comment.createdBy.createdAt) }
      </div>
    </div>
  )

}

export default Comment