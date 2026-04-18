// Persistent resume state for the Champions crawler.
// A single pipeline runs steps in order; the state records which steps
// have completed so a Ctrl-C leaves a resumable trail.

import { promises as fs } from 'node:fs';
import path from 'node:path';

export type StepName = 'natures' | 'abilities' | 'items' | 'moves' | 'pokemon' | 'pokemon_abilities' | 'learnsets';

export interface CrawlerState {
  steps: Record<StepName, 'done' | 'pending'>;
  lastRunAt: string | null;
}

const ALL_STEPS: StepName[] = ['natures', 'abilities', 'items', 'moves', 'pokemon', 'pokemon_abilities', 'learnsets'];

const DEFAULT_STATE: CrawlerState = {
  steps: {
    natures: 'pending',
    abilities: 'pending',
    items: 'pending',
    moves: 'pending',
    pokemon: 'pending',
    pokemon_abilities: 'pending',
    learnsets: 'pending',
  },
  lastRunAt: null,
};

export function defaultStatePath(cwd = process.cwd()): string {
  return path.join(cwd, '.crawler-state.json');
}

export async function loadState(file: string): Promise<CrawlerState> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<CrawlerState>;
    const steps = { ...DEFAULT_STATE.steps, ...(parsed.steps ?? {}) } as CrawlerState['steps'];
    return { steps, lastRunAt: parsed.lastRunAt ?? null };
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { ...DEFAULT_STATE };
    throw err;
  }
}

export async function saveState(file: string, state: CrawlerState): Promise<void> {
  const next = { ...state, lastRunAt: new Date().toISOString() };
  await fs.writeFile(file, JSON.stringify(next, null, 2));
}

export function resetState(): CrawlerState {
  return {
    steps: { ...DEFAULT_STATE.steps },
    lastRunAt: null,
  };
}

export function stepDone(state: CrawlerState, step: StepName): void {
  state.steps[step] = 'done';
}

export function isStepDone(state: CrawlerState, step: StepName): boolean {
  return state.steps[step] === 'done';
}
