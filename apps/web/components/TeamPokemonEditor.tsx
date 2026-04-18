'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPokemonMoves, listAbilities } from '@pokesearch/api-client';
import type {
  Ability,
  Item,
  Move,
  Nature,
} from '@pokesearch/types';
import { PokemonHolder } from './PokemonHolder';
import { EVInputRow } from './EVInputRow';
import { NatureSelector } from './NatureSelector';
import { AbilityDropdown } from './AbilityDropdown';
import { ItemDropdown } from './ItemDropdown';
import { MoveSelectorRow } from './MoveSelectorRow';
import { KeyMetricsRow } from './KeyMetricsRow';
import { itemSlugFromName } from '../lib/team-calc';
import type { DraftPokemon, StatShort } from '../lib/draft-team';
import { evTotal } from '../lib/draft-team';
import { computeDraftMetrics } from '../lib/draft-metrics';

interface Props {
  pokemon: DraftPokemon;
  level: 50 | 100;
  items: Item[];
  natures: Nature[];
  onChangeRequest: () => void;
  onRemove: () => void;
  onSetAbility: (id: number | null) => void;
  onSetItem: (id: number | null) => void;
  onSetNature: (id: number) => void;
  onSetEv: (stat: StatShort, value: number) => void;
  onSetMove: (moveSlot: number, moveId: number | null) => void;
  onIllegalMovesDetected: (legalMoveIds: Set<number>) => void;
}

export function TeamPokemonEditor({
  pokemon,
  level,
  items,
  natures,
  onChangeRequest,
  onRemove,
  onSetAbility,
  onSetItem,
  onSetNature,
  onSetEv,
  onSetMove,
  onIllegalMovesDetected,
}: Props) {
  const locale = useLocale();
  const t = useTranslations('create');

  const [learnableMoves, setLearnableMoves] = useState<Move[]>([]);
  const [learnableAbilities, setLearnableAbilities] = useState<Ability[]>([]);
  const [moveFilter, setMoveFilter] = useState<'all' | 'attack' | 'status'>('all');
  const lastFetchedPokemonId = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAbilities({ pokemonId: pokemon.pokemonId })
      .then((res) => {
        if (cancelled) return;
        setLearnableAbilities(res.items);
      })
      .catch(() => {
        if (cancelled) return;
        setLearnableAbilities([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pokemon.pokemonId]);

  // Default-select the first ability once list arrives.
  useEffect(() => {
    if (pokemon.abilityId == null && learnableAbilities.length > 0) {
      onSetAbility(learnableAbilities[0].id);
    }
  }, [pokemon.abilityId, learnableAbilities, onSetAbility]);

  useEffect(() => {
    let cancelled = false;
    if (lastFetchedPokemonId.current === pokemon.pokemonId) {
      return;
    }
    getPokemonMoves({ pokemonId: pokemon.pokemonId })
      .then((res) => {
        if (cancelled) return;
        lastFetchedPokemonId.current = pokemon.pokemonId;
        setLearnableMoves(res.moves);
      })
      .catch(() => {
        if (cancelled) return;
        setLearnableMoves([]);
      });
    return () => {
      cancelled = true;
    };
  }, [pokemon.pokemonId]);

  // Ability-change ripple: if the selected ability changes, some moves may no
  // longer be legal (they will always be a subset of learnableMoves, but
  // keeping a simple check in case a future backend narrows it).
  const legalMoveIds = useMemo(
    () => new Set(learnableMoves.map((m) => m.id)),
    [learnableMoves],
  );
  useEffect(() => {
    const illegal = pokemon.moves.filter((m) => !legalMoveIds.has(m.moveId));
    if (illegal.length > 0 && legalMoveIds.size > 0) {
      onIllegalMovesDetected(legalMoveIds);
    }
  }, [legalMoveIds, pokemon.moves, onIllegalMovesDetected]);

  const natureById = useMemo(
    () => new Map(natures.map((n) => [n.id, n])),
    [natures],
  );
  const abilityById = useMemo(
    () => new Map(learnableAbilities.map((a) => [a.id, a])),
    [learnableAbilities],
  );
  const itemById = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items],
  );
  const movesById = useMemo(
    () => new Map(learnableMoves.map((m) => [m.id, m])),
    [learnableMoves],
  );

  const metrics = useMemo(
    () =>
      computeDraftMetrics(
        pokemon,
        level,
        natureById.get(pokemon.natureId),
        pokemon.abilityId != null ? abilityById.get(pokemon.abilityId) : undefined,
        pokemon.itemId != null ? itemById.get(pokemon.itemId) : null,
        movesById,
      ),
    [pokemon, level, natureById, abilityById, itemById, movesById],
  );

  const evUsed = evTotal(pokemon.evs);
  const evRemaining = 510 - evUsed;

  const speciesName =
    locale === 'ko' ? pokemon.full.nameKo : pokemon.full.nameEn;
  const selectedItem =
    pokemon.itemId != null ? (itemById.get(pokemon.itemId) ?? null) : null;

  const moveRows = [1, 2, 3, 4].map((slot) => {
    const selected = pokemon.moves.find((m) => m.slotOrder === slot);
    const moveId = selected?.moveId ?? null;
    const damage = moveId != null ? (metrics.damageByMoveId[moveId] ?? null) : null;
    const currentMove = moveId != null ? movesById.get(moveId) : undefined;
    const filteredMoves = learnableMoves.filter((m) => {
      if (moveFilter === 'all') return true;
      if (moveFilter === 'attack') return m.category !== 'status';
      return m.category === 'status';
    });
    const slotMoves =
      currentMove && !filteredMoves.includes(currentMove)
        ? [currentMove, ...filteredMoves]
        : filteredMoves;
    return (
      <MoveSelectorRow
        key={slot}
        slotOrder={slot}
        selectedMoveId={moveId}
        learnableMoves={slotMoves}
        damage={damage}
        onChange={(id) => onSetMove(slot, id)}
      />
    );
  });

  return (
    <div
      data-testid="pokemon-editor"
      className="border border-border-tertiary rounded-lg p-2 mb-1.5"
    >
      <div className="flex gap-2 items-center mb-1.5">
        <PokemonHolder
          spriteUrl={pokemon.full.spriteUrl}
          itemName={
            selectedItem ? itemSlugFromName(selectedItem.nameEn) : undefined
          }
          size={44}
        />
        <div className="flex-1 text-[11px] font-medium truncate">
          {speciesName}
        </div>
        <button
          type="button"
          data-testid="change-pokemon"
          onClick={onChangeRequest}
          className="text-[9px] border border-border-tertiary rounded-sm px-1.5 py-[2px] min-h-[28px]"
        >
          {t('change')}
        </button>
        <button
          type="button"
          data-testid="remove-pokemon"
          onClick={onRemove}
          className="text-[9px] text-danger-fg border border-danger-border rounded-sm px-1.5 py-[2px] min-h-[28px]"
          aria-label={t('remove')}
        >
          ×
        </button>
      </div>
      <Row label={t('ability')}>
        <AbilityDropdown
          abilities={learnableAbilities}
          value={pokemon.abilityId}
          onChange={onSetAbility}
        />
      </Row>
      <Row label={t('item')}>
        <ItemDropdown
          items={items}
          value={pokemon.itemId}
          onChange={onSetItem}
        />
      </Row>
      <Row label={t('nature')}>
        <NatureSelector
          natures={natures}
          value={pokemon.natureId}
          onChange={onSetNature}
        />
      </Row>

      <div className="mt-2">
        <KeyMetricsRow
          physicalBulk={metrics.physicalBulk}
          specialBulk={metrics.specialBulk}
          speed={metrics.speed}
        />
      </div>

      <div className="flex items-center justify-between mt-2 mb-1">
        <span className="text-[10px] text-text-secondary font-medium">
          {t('evs')}
        </span>
        <span className="text-[9px] text-text-tertiary tabular-nums">
          {t('evTotal', { used: evUsed })}
        </span>
      </div>
      {(
        [
          ['H', 'h'],
          ['A', 'a'],
          ['B', 'b'],
          ['C', 'c'],
          ['D', 'd'],
          ['S', 's'],
        ] as const
      ).map(([letter, stat]) => (
        <EVInputRow
          key={stat}
          letter={letter}
          stat={stat}
          ev={pokemon.evs[stat]}
          finalStat={metrics.finalStat[stat]}
          natureEffect={metrics.natureEffect[stat]}
          maxAllowed={pokemon.evs[stat] + evRemaining}
          onChange={(v) => onSetEv(stat, v)}
        />
      ))}

      <div className="flex items-center justify-between mt-2 mb-1">
        <span className="text-[10px] text-text-secondary font-medium">
          {t('moves')}
        </span>
        <span className="text-[9px] text-text-tertiary">{t('movesHint')}</span>
      </div>
      <div className="flex gap-[3px] mb-1">
        {(['all', 'attack', 'status'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setMoveFilter(f)}
            className={`text-[9px] px-2 py-[2px] rounded-sm border min-h-[24px] ${
              moveFilter === f
                ? 'border-text-primary bg-text-primary text-bg-primary'
                : 'border-border-tertiary text-text-secondary'
            }`}
          >
            {f === 'all' ? t('movesAll') : f === 'attack' ? t('movesAttack') : t('movesStatus')}
          </button>
        ))}
      </div>
      {moveRows}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border-tertiary py-[5px] text-[10px]">
      <span className="text-text-secondary">{label}</span>
      {children}
    </div>
  );
}
