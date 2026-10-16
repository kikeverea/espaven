import { createLazyFileRoute } from '@tanstack/react-router'
import SuppliersIndex from '@/features/suppliers/SuppliersIndex'

export const Route = createLazyFileRoute('/suppliers/')({
  component: () => <SuppliersIndex />
})
