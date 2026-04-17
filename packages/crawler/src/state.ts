// Persistent resume state for the crawler. Stored as JSON at the project
// root so it survives restarts and can be inspected by hand.

import { promises as fs } from 'node:fs';
import path from 'node:path';

export interface CrawlerState {
  pokemon: { doneDex: number[] };
  moves: { doneIds: number[] };
  abilities: { doneIds: number[] };
  items: { doneIds: number[] };
  learnsets: { donePokemonIds: number[] };
  lastRunAt: string | null;
}

const DEFAULT_STATE: CrawlerState = {
  pokemon: { doneDex: [] },
  moves: { doneIds: [] },
  abilities: { doneIds: [] },
  items: { doneIds: [] },
  learnsets: { donePokemonIds: [] },
  lastRunAt: null,
};

export function defaultStatePath(cwd = process.cwd()): string {
  return path.join(cwd, '.crawler-state.json');
}

export async function loadState(file: string): Promise<CrawlerState> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CrawlerState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { ...DEFAULT_STATE };
    throw err;
  }
}

export async function saveState(file: string, state: CrawlerState): Promise<void> {
  const next = { ...state, lastRunAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(next, null, 2));
}

export function hasDone(list: number[], id: number): boolean {
  return list.includes(id);
}

export function markDone(list: number[], id: number): number[] {
  if (list.includes(id)) return list;
  return [...list, id];
}

export function resetState(): CrawlerState {
  return { ...DEFAULT_STATE };
}
