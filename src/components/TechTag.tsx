interface TechTagProps {
  label: string
  size?: 'sm' | 'xs'
}

export default function TechTag({ label, size = 'xs' }: TechTagProps) {
  return (
    <span
      className={`font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded ${
        size === 'xs' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1'
      }`}
    >
      {label}
    </span>
  )
}
