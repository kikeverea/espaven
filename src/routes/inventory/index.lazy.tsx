import { createLazyFileRoute } from '@tanstack/react-router'
import InventoryIndex from '@/features/inventory/InventoryIndex'

export const Route = createLazyFileRoute('/inventory/')({
  component: () => <InventoryIndex />
})