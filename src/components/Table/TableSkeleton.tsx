import { Skeleton } from "@/components/ui/skeleton"

type SkeletonTableProps = {
  rowCount?: number,
  colCount?: number
}

const SkeletonTable = ({ rowCount = 5, colCount = 3 }: SkeletonTableProps) => {
  return (
    <div className="flex w-full flex-col gap-2">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div className="flex gap-4" key={`row-${index}`}>
          { Array.from({ length: colCount }).map((_, index) => (
            <Skeleton className="h-5 my-2 flex-1" key={`col-${index}`}/>
          ))}
        </div>
      ))}
    </div>
  )
}

export default SkeletonTable