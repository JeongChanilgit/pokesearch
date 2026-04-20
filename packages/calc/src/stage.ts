export const MIN_STAGE = -6;
export const MAX_STAGE = 6;
export type Stage = number;

function assertStage(stage: number): void {
  if (!Number.isInteger(stage) || stage < MIN_STAGE || stage > MAX_STAGE) {
    throw new TypeError(
      `stage must be an integer in [${MIN_STAGE}, ${MAX_STAGE}], got ${stage}`,
    );
  }
}

export function stageMultiplier(stage: Stage): number {
  assertStage(stage);
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}

export function applyStage(value: number, stage: Stage): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`value must be a non-negative finite number, got ${value}`);
  }
  return Math.floor(value * stageMultiplier(stage));
}
