import { cn } from '@/lib/utils.ts'

type AvatarProps = {
  name: string,
  className?: string
}

const LETTER_COLORS = [
  'bg-red-600',     // A
  'bg-orange-700',  // B
  'bg-amber-700',   // C
  'bg-yellow-700',  // D
  'bg-lime-700',    // E
  'bg-green-700',   // F
  'bg-emerald-700', // G
  'bg-teal-700',    // H
  'bg-cyan-700',    // I
  'bg-sky-700',     // J
  'bg-blue-600',    // K
  'bg-indigo-600',  // L
  'bg-violet-600',  // M
  'bg-purple-600',  // N
  'bg-fuchsia-600', // O
  'bg-pink-600',    // P
  'bg-rose-600',    // Q
  'bg-slate-500',   // R
  'bg-gray-500',    // S
  'bg-zinc-500',    // T
  'bg-neutral-500', // U
  'bg-stone-500',   // V
  'bg-amber-900',   // W
  'bg-sky-900',     // X
  'bg-violet-900',  // Y
  'bg-pink-900',    // Z
]

const colorForLetter = (letter: string): string => {
  const code = letter.toUpperCase().charCodeAt(0)
  const index = code >= 65 && code <= 90
    ? code - 65
    : code % LETTER_COLORS.length

  return LETTER_COLORS[index]
}

const Avatar = ({ name, className }: AvatarProps) => {
  const letter = name.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className={cn(
      'w-13.5 h-13.5 rounded-lg border grid place-content-center text-white text-2xl font-semibold',
      colorForLetter(letter),
      className
    )}>
      {letter}
    </div>
  )
}

export default Avatar
