import { Badge } from '@/components/ui/badge'
import type { InventoryMovement } from '@/features/inventory/types.ts'

export const movementBadge = (movement: InventoryMovement['movement']) => {
  const label = movement === 'in' ? 'Entrada' : 'Salida'
  const colors = movement === 'in'
    ? 'bg-green-50 text-green-500 border-green-300'
    : 'bg-red-50 text-red-500 border-red-300'

  return (
    <Badge variant="outline" className={`rounded-md py-3 ${colors}`}>
      { label }
    </Badge>
  )
}