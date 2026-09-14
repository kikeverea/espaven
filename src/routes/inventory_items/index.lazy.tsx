import { createLazyFileRoute } from '@tanstack/react-router'
import InventoryItemsIndex from '@/features/inventory/inventoryItems/InventoryItemsIndex.tsx'

export const Route = createLazyFileRoute('/inventory_items/')({
  component: () => <InventoryItemsIndex />
})