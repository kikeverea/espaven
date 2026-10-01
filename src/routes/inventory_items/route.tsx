import { createFileRoute } from '@tanstack/react-router'
import { authorize } from '@/lib/ability.ts'

export const Route = createFileRoute('/inventory_items')({
  beforeLoad: authorize('read', 'InventoryItem'),
})
