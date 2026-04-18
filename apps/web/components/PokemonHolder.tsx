'use client';

import { useState } from 'react';
import { fallbackSpriteUrl } from '@pokesearch/calc';

interface Props {
  spriteUrl: string;
  dexNum?: number;
  itemName?: string;
  size?: 32 | 44;
}

export function PokemonHolder({ spriteUrl, dexNum, itemName, size = 44 }: Props) {
  const [errored, setErrored] = useState(false);
  const itemSize = Math.round(size * 0.45);

  const src =
    errored && dexNum != null ? fallbackSpriteUrl(dexNum) : spriteUrl;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-full h-full object-contain"
        onError={
          !errored && dexNum != null ? () => setErrored(true) : undefined
        }
      />
      {itemName && (
        <img
          src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/${itemName}.png`}
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
