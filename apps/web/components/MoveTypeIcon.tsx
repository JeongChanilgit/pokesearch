export function MoveTypeIcon({ type, className }: { type: string; className?: string }) {
  return (
    <img
      src={`/sprites/types/${type.toLowerCase()}.png`}
      alt={type}
      className={className ?? 'h-[14px] w-auto'}
      loading="lazy"
      decoding="async"
    />
  );
}
