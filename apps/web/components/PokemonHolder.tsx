'use client';

interface Props {
  spriteUrl: string;
  itemName?: string;
  size?: 32 | 44;
}

export function PokemonHolder({ spriteUrl, itemName, size = 44 }: Props) {
  const itemSize = Math.round(size * 0.45);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img
        src={spriteUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain"
      />
      {itemName && (
        <img
          src={`/sprites/items/${itemName}.png`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute bottom-[-3px] right-[-3px] bg-bg-primary border border-border-tertiary rounded-full box-border"
          style={{ width: itemSize, height: itemSize, padding: 1 }}
        />
      )}
    </div>
  );
}
