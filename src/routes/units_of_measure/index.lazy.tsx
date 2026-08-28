import { createLazyFileRoute } from '@tanstack/react-router'
import UnitsOfMeasureIndex from '@/features/unitsOfMeasure/UnitsOfMeasureIndex.tsx'

export const Route = createLazyFileRoute('/units_of_measure/')({
  component: () => <UnitsOfMeasureIndex />
})