interface Props {
  count: number;
  liked?: boolean;
}

export function LikeButton({ count, liked = false }: Props) {
  return (
    <span
      data-testid="like-button"
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[14px] text-[10px] border min-h-[28px] ${
        liked
          ? 'bg-like-liked-bg text-like-liked-fg border-like-liked-border'
          : 'bg-transparent text-text-secondary border-border-tertiary'
      }`}
    >
      ♡ {count}
    </span>
  );
}
