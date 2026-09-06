import { createLazyFileRoute } from '@tanstack/react-router'
import InventoryCategoriesIndex from '@/features/inventoryCategories/InventoryCategoriesIndex'

export const Route = createLazyFileRoute('/inventory_categories/')({
  component: () => <InventoryCategoriesIndex />
})