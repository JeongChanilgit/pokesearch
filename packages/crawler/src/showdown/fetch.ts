// Fetches Pokémon Showdown `.ts` data files from GitHub raw at a pinned
// commit SHA. Rate-limited (3 req/s token bucket) + retries.
//
// Pinning a SHA makes the crawl reproducible across days: everyone hitting
// `pnpm crawl` sees the same Champions data until the SHA is bumped.

const SHOWDOWN_REPO = 'smogon/pokemon-showdown';

// Bump this SHA to pull fresher Champions data. Verify the Champions mod
// files still exist at `data/mods/champions/` before bumping.
export const SHOWDOWN_PINNED_SHA = '31ec3498f76c7c9faeac0e2bb648e9b89ddf6ff2';

function rawUrl(sha: string, path: string): string {
  return `https://raw.githubusercontent.com/${SHOWDOWN_REPO}/${sha}/${path}`;
}

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

const defaultBucket = makeBucket(3);

// ---------- Fetch ----------

export interface FetchOptions {
  bucket?: TokenBucket;
  retries?: number;
  sha?: string;
}

export async function fetchShowdownFile(
  path: string,
  opts: FetchOptions = {}
): Promise<string> {
  const bucket = opts.bucket ?? defaultBucket;
  const retries = opts.retries ?? 3;
  const sha = opts.sha ?? SHOWDOWN_PINNED_SHA;
  const url = rawUrl(sha, path);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    await acquire(bucket);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'PokeSearch-Crawler/0.2 (+https://github.com/pokesearch)',
          Accept: 'text/plain',
        },
      });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`Showdown ${path} → ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`Showdown ${path} → ${res.status}`);
      }
      return await res.text();
    } catch (err) {
      lastErr = err;
      const backoff = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, backoff));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// ---------- Path shortcuts ----------

export const SHOWDOWN_PATHS = {
  basePokedex: 'data/pokedex.ts',
  baseMoves: 'data/moves.ts',
  baseAbilities: 'data/abilities.ts',
  baseItems: 'data/items.ts',
  baseNatures: 'data/natures.ts',
  textAbilities: 'data/text/abilities.ts',
  textItems: 'data/text/items.ts',
  modFormats: 'data/mods/champions/formats-data.ts',
  modMoves: 'data/mods/champions/moves.ts',
  modAbilities: 'data/mods/champions/abilities.ts',
  modItems: 'data/mods/champions/items.ts',
  modLearnsets: 'data/mods/champions/learnsets.ts',
} as const;
