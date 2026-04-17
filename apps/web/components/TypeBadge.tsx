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

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TypeBadge({ type, suffix = '' }: Props) {
  return (
    <span
      className={`inline-block px-1.5 py-[1px] rounded-sm text-[9px] font-medium mr-[3px] t-${type}`}
    >
      {capitalize(type)}
      {suffix}
    </span>
  );
}
