/**
 * download-type-sprites.ts
 *
 * Downloads Gen VIII Sword-Shield circular type icons from PokeAPI and
 * saves them to apps/web/public/sprites/types/<typeName>.png.
 *
 * Usage:
 *   pnpm --filter @pokesearch/crawler download-type-sprites
 *   pnpm --filter @pokesearch/crawler download-type-sprites --force
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FORCE = process.argv.includes("--force");

const WORKSPACE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  ".."
);
const OUTPUT_DIR = path.join(
  WORKSPACE_ROOT,
  "apps",
  "web",
  "public",
  "sprites",
  "types"
);

const TYPE_NAMES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

const RATE_LIMIT_RPS = 3;
const TOKEN_INTERVAL_MS = Math.ceil(1000 / RATE_LIMIT_RPS);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class RateLimiter {
  private lastCallAt = 0;
  async acquire(): Promise<void> {
    const now = Date.now();
    const wait = TOKEN_INTERVAL_MS - (now - this.lastCallAt);
    if (wait > 0) await sleep(wait);
    this.lastCallAt = Date.now();
  }
}

const POKEAPI_BASE = "https://pokeapi.co/api/v2/type";

interface PokeApiType {
  sprites: {
    "generation-viii"?: {
      "sword-shield"?: {
        name_icon: string | null;
      };
    };
  };
}

async function fetchIconUrl(
  name: string
): Promise<{ url: string } | { missing: true } | { error: string }> {
  const res = await fetch(`${POKEAPI_BASE}/${name}`);
  if (res.status === 404) return { missing: true };
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const data = (await res.json()) as PokeApiType;
  const url = data?.sprites?.["generation-viii"]?.["sword-shield"]?.name_icon ?? null;
  if (!url) return { missing: true };
  return { url };
}

async function downloadPng(url: string, destPath: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download PNG (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.writeFile(destPath, buf);
}

async function main() {
  await fs.promises.mkdir(OUTPUT_DIR, { recursive: true });

  const total = TYPE_NAMES.length;
  let downloaded = 0;
  let skippedExisting = 0;
  let missing = 0;
  let errors = 0;

  const rateLimiter = new RateLimiter();

  console.log(`Downloading ${total} type icons. Output dir: ${OUTPUT_DIR}`);
  if (FORCE) console.log("--force flag set: re-downloading existing icons.");

  for (let i = 0; i < TYPE_NAMES.length; i++) {
    const name = TYPE_NAMES[i];
    const progress = `[${i + 1}/${total}]`;
    const destPath = path.join(OUTPUT_DIR, `${name}.png`);

    if (!FORCE && fs.existsSync(destPath)) {
      skippedExisting++;
      console.log(`${progress} EXISTS  ${name}.png`);
      continue;
    }

    await rateLimiter.acquire();
    const result = await fetchIconUrl(name);

    if ("missing" in result) {
      missing++;
      console.warn(`${progress} MISSING ${name}`);
      continue;
    }
    if ("error" in result) {
      errors++;
      console.error(`${progress} ERROR   ${name}: ${result.error}`);
      continue;
    }

    try {
      await downloadPng(result.url, destPath);
      downloaded++;
      console.log(`${progress} OK      ${name}.png`);
    } catch (err) {
      errors++;
      console.error(`${progress} DLERR   ${name}: ${(err as Error).message}`);
    }
  }

  console.log(
    `\nDone. downloaded=${downloaded} skipped-existing=${skippedExisting} missing=${missing} errors=${errors}`
  );

  if (errors > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
