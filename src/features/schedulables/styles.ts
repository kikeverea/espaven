export type SchedulableKind = 'workOrder' | 'service'

type SchedulableStyle = {
  label: string                       // in the legend
  card: string                        // a timeline block: background and border
  title: string
  sub: string
  event: { backgroundColor: string, borderColor: string, textColor: string }     // a calendar event
}

export const SCHEDULABLE_STYLES: Partial<Record<SchedulableKind, SchedulableStyle>> = {
  workOrder: {
    label: 'Órdenes de trabajo',
    card: 'border-[#C9C5C0] border-l-4 border-l-sky-800 bg-white shadow-[0_1px_2px_rgba(28,25,23,.10)]',
    title: 'text-[#1C1917]',
    sub: 'text-[#78716C]',
    event: { backgroundColor: 'var(--color-sky-800)', borderColor: 'var(--color-sky-900)', textColor: 'var(--color-white)' },
  },
}

export const COMPLETED_STYLE: SchedulableStyle = {
  label: 'Completadas',
  card: 'border-[#BFDCC8] bg-[#E8F3EC]',
  title: 'text-[#2F5E3F]',
  sub: 'text-[#5E8A6C]',
  event: { backgroundColor: '#E8F3EC', borderColor: '#BFDCC8', textColor: '#2F5E3F' },
}
