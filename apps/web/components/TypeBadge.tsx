export const POKEMON_TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

interface Props {
  type: PokemonType;
  suffix?: string;
}

export function TypeBadge({ type, suffix = '' }: Props) {
  return (
    <span className="inline-flex items-center align-middle mr-[3px]">
      <img
        src={`/sprites/types/${type}.png`}
        alt={type}
        className="h-[14px] w-auto"
        loading="lazy"
        decoding="async"
      />
      {suffix && <span className="text-[9px] font-medium ml-0.5">{suffix}</span>}
    </span>
  );
}
