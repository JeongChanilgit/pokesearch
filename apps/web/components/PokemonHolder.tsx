interface Props {
  pokemonId: number;
  itemName?: string;
  size?: 32 | 44;
}

export function PokemonHolder({ pokemonId, itemName, size = 44 }: Props) {
  const itemSize = Math.round(size * 0.45);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <img
        src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/pokemon/${pokemonId}.png`}
        alt=""
        className="w-full h-full object-contain"
      />
      {itemName && (
        <img
          src={`https://cdn.jsdelivr.net/gh/PokeAPI/sprites@master/sprites/items/${itemName}.png`}
          alt=""
          className="absolute bottom-[-3px] right-[-3px] bg-bg-primary border border-border-tertiary rounded-full box-border"
          style={{ width: itemSize, height: itemSize, padding: 1 }}
        />
      )}
    </div>
  );
}
