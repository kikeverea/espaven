import { createLazyFileRoute } from '@tanstack/react-router'
import GenericPartsIndex from '@/features/genericParts/GenericPartsIndex'

export const Route = createLazyFileRoute('/generic_parts/')({
  component: () => <GenericPartsIndex />
})