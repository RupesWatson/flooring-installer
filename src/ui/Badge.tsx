type Color = 'blue' | 'green' | 'amber' | 'purple' | 'gray' | 'rose'

interface Props {
  children: string
  color?: Color
}

const colors: Record<Color, string> = {
  blue:   'bg-blue-100 text-blue-800',
  green:  'bg-green-100 text-green-800',
  amber:  'bg-amber-100 text-amber-800',
  purple: 'bg-purple-100 text-purple-800',
  gray:   'bg-gray-100 text-gray-700',
  rose:   'bg-rose-100 text-rose-800',
}

export function Badge({ children, color = 'gray' }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}
