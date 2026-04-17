import type {
  EVs,
  IVs,
  Level,
  PokemonFull,
  TypeName,
} from '@pokesearch/types';

export interface DraftMove {
  moveId: number;
  slotOrder: number;
}

export interface DraftPokemon {
  slotOrder: number;
  pokemonId: number;
  /** Full Pokémon data cached so the editor can render + live-calc without refetching. */
  full: PokemonFull;
  abilityId: number | null;
  itemId: number | null;
  natureId: number;
  evs: EVs;
  ivs: IVs;
  moves: DraftMove[];
  teraType: TypeName | null;
}

export interface DraftTeam {
  name: string;
  description: string;
  level: Level;
  pokemons: DraftPokemon[];
}

export const INITIAL_DRAFT: DraftTeam = {
  name: '',
  description: '',
  level: 50,
  pokemons: [],
};

export const DEFAULT_EVS: EVs = { h: 0, a: 0, b: 0, c: 0, d: 0, s: 0 };
export const DEFAULT_IVS: IVs = { h: 31, a: 31, b: 31, c: 31, d: 31, s: 31 };
export const DEFAULT_NATURE_ID = 1; // seed guarantees id=1 exists

export type StatShort = 'h' | 'a' | 'b' | 'c' | 'd' | 's';

export type DraftAction =
  | { type: 'set-name'; name: string }
  | { type: 'set-description'; description: string }
  | { type: 'set-level'; level: Level }
  | { type: 'add-pokemon'; full: PokemonFull }
  | { type: 'remove-pokemon'; slotOrder: number }
  | { type: 'change-pokemon'; slotOrder: number; full: PokemonFull }
  | { type: 'set-ability'; slotOrder: number; abilityId: number | null }
  | { type: 'set-item'; slotOrder: number; itemId: number | null }
  | { type: 'set-nature'; slotOrder: number; natureId: number }
  | { type: 'set-ev'; slotOrder: number; stat: StatShort; value: number }
  | { type: 'set-move'; slotOrder: number; moveSlot: number; moveId: number | null }
  | { type: 'clear-illegal-moves'; slotOrder: number; legalMoveIds: Set<number> };

function nextSlot(pokemons: DraftPokemon[]): number {
  const used = new Set(pokemons.map((p) => p.slotOrder));
  for (let i = 1; i <= 6; i += 1) if (!used.has(i)) return i;
  return pokemons.length + 1;
}

function withPokemon(
  state: DraftTeam,
  slotOrder: number,
  update: (p: DraftPokemon) => DraftPokemon,
): DraftTeam {
  return {
    ...state,
    pokemons: state.pokemons.map((p) =>
      p.slotOrder === slotOrder ? update(p) : p,
    ),
  };
}

export function draftReducer(state: DraftTeam, action: DraftAction): DraftTeam {
  switch (action.type) {
    case 'set-name':
      return { ...state, name: action.name };
    case 'set-description':
      return { ...state, description: action.description };
    case 'set-level':
      return { ...state, level: action.level };
    case 'add-pokemon': {
      if (state.pokemons.length >= 6) return state;
      const slotOrder = nextSlot(state.pokemons);
      const created: DraftPokemon = {
        slotOrder,
        pokemonId: action.full.id,
        full: action.full,
        abilityId: null,
        itemId: null,
        natureId: DEFAULT_NATURE_ID,
        evs: { ...DEFAULT_EVS },
        ivs: { ...DEFAULT_IVS },
        moves: [],
        teraType: null,
      };
      return {
        ...state,
        pokemons: [...state.pokemons, created].sort(
          (a, b) => a.slotOrder - b.slotOrder,
        ),
      };
    }
    case 'remove-pokemon':
      return {
        ...state,
        pokemons: state.pokemons.filter((p) => p.slotOrder !== action.slotOrder),
      };
    case 'change-pokemon':
      return withPokemon(state, action.slotOrder, (p) => ({
        ...p,
        pokemonId: action.full.id,
        full: action.full,
        abilityId: null,
        itemId: null,
        moves: [],
      }));
    case 'set-ability':
      return withPokemon(state, action.slotOrder, (p) => ({
        ...p,
        abilityId: action.abilityId,
      }));
    case 'set-item':
      return withPokemon(state, action.slotOrder, (p) => ({
        ...p,
        itemId: action.itemId,
      }));
    case 'set-nature':
      return withPokemon(state, action.slotOrder, (p) => ({
        ...p,
        natureId: action.natureId,
      }));
    case 'set-ev':
      return withPokemon(state, action.slotOrder, (p) => {
        const nextEvs: EVs = { ...p.evs, [action.stat]: clampEv(action.value) };
        const capped = capEvTotal(nextEvs, action.stat);
        return { ...p, evs: capped };
      });
    case 'set-move':
      return withPokemon(state, action.slotOrder, (p) => {
        const filtered = p.moves.filter((m) => m.slotOrder !== action.moveSlot);
        if (action.moveId == null) return { ...p, moves: filtered };
        // Also remove this moveId if it's already placed in another slot
        // (per rule: unique moves per Pokémon).
        const deduped = filtered.filter((m) => m.moveId !== action.moveId);
        return {
          ...p,
          moves: [
            ...deduped,
            { moveId: action.moveId, slotOrder: action.moveSlot },
          ].sort((a, b) => a.slotOrder - b.slotOrder),
        };
      });
    case 'clear-illegal-moves':
      return withPokemon(state, action.slotOrder, (p) => ({
        ...p,
        moves: p.moves.filter((m) => action.legalMoveIds.has(m.moveId)),
      }));
    default:
      return state;
  }
}

function clampEv(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 252) return 252;
  return Math.floor(n);
}

/** Cap the just-edited stat so EV total ≤ 510. */
function capEvTotal(evs: EVs, justEdited: StatShort): EVs {
  const total = evs.h + evs.a + evs.b + evs.c + evs.d + evs.s;
  if (total <= 510) return evs;
  const over = total - 510;
  const current = evs[justEdited];
  return { ...evs, [justEdited]: Math.max(0, current - over) };
}

export function evTotal(evs: EVs): number {
  return evs.h + evs.a + evs.b + evs.c + evs.d + evs.s;
}

export function draftIsValid(state: DraftTeam): boolean {
  if (state.name.trim().length === 0) return false;
  if (state.name.length > 60) return false;
  if (state.description.length > 500) return false;
  if (state.pokemons.length === 0) return false;
  for (const p of state.pokemons) {
    if (p.abilityId == null) return false;
    if (!p.natureId) return false;
    if (evTotal(p.evs) > 510) return false;
    const moveIds = new Set(p.moves.map((m) => m.moveId));
    if (moveIds.size !== p.moves.length) return false;
  }
  return true;
}
