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
      <svg width={16} height={16} aria-label={type}>
        <use href={`#type-${type}`} />
      </svg>
      {suffix && <span className="text-[9px] font-medium ml-0.5">{suffix}</span>}
    </span>
  );
}
