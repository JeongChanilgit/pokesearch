export function MoveTypeIcon({ type, className }: { type: string; className?: string }) {
  const name = type.toLowerCase();
  return (
    <svg className={className ?? 'w-4 h-4'} aria-label={name}>
      <use href={`#type-${name}`} />
    </svg>
  );
}
