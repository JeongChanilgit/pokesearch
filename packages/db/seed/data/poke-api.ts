// Tiny PokeAPI client used only at seed time. Extracts bilingual names
// (en, ko) alongside the minimum fields PokeSearch needs.

const BASE = 'https://pokeapi.co/api/v2';

interface NameEntry {
  language: { name: string };
  name: string;
}

interface PokeApiSpecies {
  id: number;
  names: NameEntry[];
}

interface PokeApiStat {
  base_stat: number;
  stat: { name: string };
}

interface PokeApiType {
  slot: number;
  type: { name: string };
}

interface PokeApiPokemon {
  id: number;
  name: string;
  stats: PokeApiStat[];
  types: PokeApiType[];
}

interface PokeApiMove {
  id: number;
  names: NameEntry[];
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
}

interface PokeApiAbility {
  id: number;
  names: NameEntry[];
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
}

function pickName(entries: NameEntry[], lang: 'en' | 'ko'): string | null {
  const hit = entries.find((e) => e.language.name === lang);
  return hit ? hit.name : null;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(`PokeAPI ${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}

export interface PokemonFetched {
  dex: number;
  nameEn: string;
  nameKo: string;
  types: string[];
  baseH: number;
  baseA: number;
  baseB: number;
  baseC: number;
  baseD: number;
  baseS: number;
  spriteUrl: string;
}

export async function fetchPokemon(dex: number): Promise<PokemonFetched | null> {
  const [species, mon] = await Promise.all([
    getJson<PokeApiSpecies>(`/pokemon-species/${dex}`),
    getJson<PokeApiPokemon>(`/pokemon/${dex}`),
  ]);
  const nameEn = pickName(species.names, 'en');
  const nameKo = pickName(species.names, 'ko');
  if (!nameEn || !nameKo) return null;

  const stat = (key: string) =>
    mon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;

  const types = [...mon.types].sort((a, b) => a.slot - b.slot).map((t) => t.type.name);

  return {
    dex,
    nameEn,
    nameKo,
    types,
    baseH: stat('hp'),
    baseA: stat('attack'),
    baseB: stat('defense'),
    baseC: stat('special-attack'),
    baseD: stat('special-defense'),
    baseS: stat('speed'),
    spriteUrl: `/sprites/pokemon/${mon.name}.png`,
  };
}

export interface MoveFetched {
  id: number;
  nameEn: string;
  nameKo: string;
  type: string;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
}

export async function fetchMove(slug: string): Promise<MoveFetched | null> {
  const m = await getJson<PokeApiMove>(`/move/${slug}`);
  const nameEn = pickName(m.names, 'en');
  const nameKo = pickName(m.names, 'ko');
  if (!nameEn || !nameKo) return null;
  const cat = m.damage_class.name;
  if (cat !== 'physical' && cat !== 'special' && cat !== 'status') return null;
  return {
    id: m.id,
    nameEn,
    nameKo,
    type: m.type.name,
    category: cat,
    power: m.power,
    accuracy: m.accuracy,
    pp: m.pp,
  };
}

interface PokeApiNature {
  id: number;
  names: NameEntry[];
  increased_stat: { name: string } | null;
  decreased_stat: { name: string } | null;
}

export interface NatureFetched {
  id: number;
  nameEn: string;
  nameKo: string;
  boostStat: 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
  reduceStat: 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe' | null;
}

const STAT_MAP: Record<string, 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe'> = {
  'hp': 'hp',
  'attack': 'atk',
  'defense': 'def',
  'special-attack': 'spa',
  'special-defense': 'spd',
  'speed': 'spe',
};

export async function fetchNature(slug: string): Promise<NatureFetched | null> {
  const n = await getJson<PokeApiNature>(`/nature/${slug}`);
  const nameEn = pickName(n.names, 'en');
  const nameKo = pickName(n.names, 'ko');
  if (!nameEn || !nameKo) return null;
  return {
    id: n.id,
    nameEn,
    nameKo,
    boostStat: n.increased_stat ? STAT_MAP[n.increased_stat.name] ?? null : null,
    reduceStat: n.decreased_stat ? STAT_MAP[n.decreased_stat.name] ?? null : null,
  };
}

export interface AbilityFetched {
  id: number;
  nameEn: string;
  nameKo: string;
  descriptionEn: string;
  descriptionKo: string;
}

export async function fetchAbility(slug: string): Promise<AbilityFetched | null> {
  const a = await getJson<PokeApiAbility>(`/ability/${slug}`);
  const nameEn = pickName(a.names, 'en');
  const nameKo = pickName(a.names, 'ko');
  if (!nameEn || !nameKo) return null;
  const descEn =
    a.flavor_text_entries.find((f) => f.language.name === 'en')?.flavor_text ?? '';
  const descKo =
    a.flavor_text_entries.find((f) => f.language.name === 'ko')?.flavor_text ?? '';
  return {
    id: a.id,
    nameEn,
    nameKo,
    descriptionEn: descEn.replace(/[\n\f]/g, ' '),
    descriptionKo: descKo.replace(/[\n\f]/g, ' '),
  };
}

// Gentle rate-limit helper. Runs `items` through `fn` with a small pause
// between chunks so we don\u2019t hammer PokeAPI.
export async function batchFetch<T, R>(
  items: T[],
  fn: (item: T) => Promise<R | null>,
  opts: { concurrency?: number; label?: string } = {}
): Promise<R[]> {
  const concurrency = opts.concurrency ?? 8;
  const out: R[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const results = await Promise.all(
      chunk.map(async (item) => {
        try {
          return await fn(item);
        } catch {
          return null;
        }
      })
    );
    for (const r of results) {
      if (r !== null && r !== undefined) out.push(r);
    }
    if (opts.label) {
      process.stdout.write(
        `  ${opts.label}: ${Math.min(i + concurrency, items.length)}/${items.length}\r`
      );
    }
  }
  if (opts.label) process.stdout.write('\n');
  return out;
}
