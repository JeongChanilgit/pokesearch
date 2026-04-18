export function MoveTypeIcon({ type, className }: { type: string; className?: string }) {
  return (
    <svg className={className} width={16} height={16} aria-hidden>
      <use href={`#type-${type.toLowerCase()}`} />
    </svg>
  );
}
