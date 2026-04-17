// Typed PokeAPI client with a self-imposed 10 req/s token-bucket limiter.

const BASE = 'https://pokeapi.co/api/v2';

const USER_AGENT =
  process.env.POKESEARCH_CRAWLER_UA ??
  'PokeSearch-Crawler/0.1 (+https://github.com/pokesearch; contact=admin@pokesearch.local)';

// ---------- Rate limiter ----------

interface TokenBucket {
  tokens: number;
  capacity: number;
  refillPerMs: number;
  lastRefillMs: number;
}

function makeBucket(ratePerSec: number): TokenBucket {
  return {
    tokens: ratePerSec,
    capacity: ratePerSec,
    refillPerMs: ratePerSec / 1000,
    lastRefillMs: Date.now(),
  };
}

async function acquire(bucket: TokenBucket): Promise<void> {
  for (;;) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefillMs;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + elapsed * bucket.refillPerMs);
    bucket.lastRefillMs = now;
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return;
    }
    const waitMs = Math.ceil((1 - bucket.tokens) / bucket.refillPerMs);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

const defaultBucket = makeBucket(10);

// ---------- Fetch ----------

export interface FetchOptions {
  bucket?: TokenBucket;
  retries?: number;
}

export async function getJson<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const bucket = opts.bucket ?? defaultBucket;
  const retries = opts.retries ?? 3;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    await acquire(bucket);
    try {
      const res = await fetch(`${BASE}${path}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`PokeAPI ${path} → ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`PokeAPI ${path} → ${res.status}`);
      }
      return (await res.json()) as T;
    } catch (err) {
      lastErr = err;
      const backoff = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// ---------- Response shapes ----------

export interface NameEntry {
  language: { name: string };
  name: string;
}

export interface FlavorEntry {
  flavor_text: string;
  language: { name: string };
}

export interface PokeApiListing {
  count: number;
  results: { name: string; url: string }[];
}

export interface PokeApiVariety {
  is_default: boolean;
  pokemon: { name: string; url: string };
}

export interface PokeApiSpecies {
  id: number;
  name: string;
  names: NameEntry[];
  varieties: PokeApiVariety[];
}

export interface PokeApiStat {
  base_stat: number;
  stat: { name: string };
}

export interface PokeApiType {
  slot: number;
  type: { name: string };
}

export interface PokeApiPokemonMove {
  move: { name: string; url: string };
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  stats: PokeApiStat[];
  types: PokeApiType[];
  moves: PokeApiPokemonMove[];
}

export interface PokeApiMove {
  id: number;
  name: string;
  names: NameEntry[];
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
}

export interface PokeApiAbility {
  id: number;
  name: string;
  names: NameEntry[];
  flavor_text_entries: FlavorEntry[];
}

export interface PokeApiItem {
  id: number;
  name: string;
  names: NameEntry[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: { name: string };
  }[];
  flavor_text_entries: {
    text: string;
    language: { name: string };
  }[];
}

// ---------- Convenience fetchers ----------

export function fetchSpeciesList(limit = 2000): Promise<PokeApiListing> {
  return getJson<PokeApiListing>(`/pokemon-species?limit=${limit}`);
}

export function fetchMoveList(limit = 2000): Promise<PokeApiListing> {
  return getJson<PokeApiListing>(`/move?limit=${limit}`);
}

export function fetchAbilityList(limit = 500): Promise<PokeApiListing> {
  return getJson<PokeApiListing>(`/ability?limit=${limit}`);
}

export function fetchItemList(limit = 2000): Promise<PokeApiListing> {
  return getJson<PokeApiListing>(`/item?limit=${limit}`);
}

export function fetchSpecies(idOrSlug: string | number): Promise<PokeApiSpecies> {
  return getJson<PokeApiSpecies>(`/pokemon-species/${idOrSlug}`);
}

export function fetchPokemon(idOrSlug: string | number): Promise<PokeApiPokemon> {
  return getJson<PokeApiPokemon>(`/pokemon/${idOrSlug}`);
}

export function fetchMove(idOrSlug: string | number): Promise<PokeApiMove> {
  return getJson<PokeApiMove>(`/move/${idOrSlug}`);
}

export function fetchAbility(idOrSlug: string | number): Promise<PokeApiAbility> {
  return getJson<PokeApiAbility>(`/ability/${idOrSlug}`);
}

export function fetchItem(idOrSlug: string | number): Promise<PokeApiItem> {
  return getJson<PokeApiItem>(`/item/${idOrSlug}`);
}

// Derive PokeAPI numeric id from the URL returned by list endpoints.
export function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  if (!m) throw new Error(`cannot parse id from ${url}`);
  return Number(m[1]);
}

export function pickName(entries: NameEntry[], lang: 'en' | 'ko'): string | null {
  const hit = entries.find((e) => e.language.name === lang);
  return hit ? hit.name : null;
}
