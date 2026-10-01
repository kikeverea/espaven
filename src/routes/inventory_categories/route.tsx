import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/inventory_categories')({
  beforeLoad: authorize('read', 'InventoryCategory'),
})
