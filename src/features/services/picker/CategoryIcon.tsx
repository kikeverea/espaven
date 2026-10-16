import { CircleDot, Cog, Disc, Droplet, Filter, Fuel, Gauge, type LucideIcon, Snowflake, Sparkles, Wrench, Zap, Car, Wind } from 'lucide-react'

/* The icons a category can have, by their lucide name. Any other, a wrench */
const ICONS: Record<string, LucideIcon> = {
  'car': Car,
  'circle-dot': CircleDot,
  'cog': Cog,
  'disc': Disc,
  'droplet': Droplet,
  'filter': Filter,
  'fuel': Fuel,
  'gauge': Gauge,
  'snowflake': Snowflake,
  'sparkles': Sparkles,
  'wind': Wind,
  'wrench': Wrench,
  'zap': Zap,
}

const CategoryIcon = ({ icon, className }: { icon?: string, className?: string }) => {
  const Icon = (icon && ICONS[icon]) || Wrench
  return <Icon aria-hidden className={ className } />
}

export default CategoryIcon
