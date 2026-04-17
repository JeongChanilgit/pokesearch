'use client';

import { useEffect, useReducer, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ApiError,
  getPokemon,
  getTeam,
  listAbilities,
  listItems,
  listNatures,
  updateTeam,
} from '@pokesearch/api-client';
import type {
  Ability,
  Item,
  Nature,
  PokemonFull,
  TeamDetail,
  TeamPokemonInputRaw,
  UpdateTeamInput,
} from '@pokesearch/types';
import { TeamMetaForm } from '../../../../../components/TeamMetaForm';
import { TeamPokemonEditor } from '../../../../../components/TeamPokemonEditor';
import { PokemonPickerModal } from '../../../../../components/PokemonPickerModal';
import { PasswordConfirmModal } from '../../../../../components/PasswordConfirmModal';
import {
  INITIAL_DRAFT,
  draftReducer,
  draftIsValid,
  DEFAULT_IVS,
  type DraftPokemon,
  type DraftTeam,
} from '../../../../../lib/draft-team';
import {
  clearVerifyToken,
  loadVerifyToken,
} from '../../../../../lib/verify-session';

type PickerMode =
  | { kind: 'closed' }
  | { kind: 'change'; slotOrder: number }
  | { kind: 'add' };

async function teamDetailToDraft(detail: TeamDetail): Promise<DraftTeam> {
  const fulls = await Promise.all(
    detail.pokemons.map((p) => getPokemon({ pokemonId: p.pokemon.id })),
  );
  const pokemons: DraftPokemon[] = detail.pokemons.map((p, idx) => {
    const full: PokemonFull = fulls[idx];
    return {
      slotOrder: p.slotOrder,
      pokemonId: p.pokemon.id,
      full,
      abilityId: p.ability.id,
      itemId: p.item?.id ?? null,
      natureId: p.nature.id,
      evs: { ...p.evs },
      ivs: { ...DEFAULT_IVS, ...p.ivs },
      moves: p.moves.map((m) => ({
        moveId: m.move.id,
        slotOrder: m.slotOrder,
      })),
      teraType: p.teraType,
    };
  });
  return {
    name: detail.name,
    description: detail.description ?? '',
    level: detail.level,
    pokemons,
  };
}

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const teamId = params?.id as string;
  const t = useTranslations('create');
  const tEdit = useTranslations('edit');

  const [state, dispatch] = useReducer(draftReducer, INITIAL_DRAFT);
  const [loaded, setLoaded] = useState(false);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [picker, setPicker] = useState<PickerMode>({ kind: 'closed' });
  const [token, setToken] = useState<string | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadVerifyToken(teamId);
    if (!stored) {
      setVerifyOpen(true);
      return;
    }
    setToken(stored);
  }, [teamId]);

  useEffect(() => {
    if (!token || loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const [team, a, i, n] = await Promise.all([
          getTeam(teamId),
          listAbilities(),
          listItems(),
          listNatures(),
        ]);
        if (cancelled) return;
        const draft = await teamDetailToDraft(team);
        if (cancelled) return;
        dispatch({ type: 'set-name', name: draft.name });
        dispatch({ type: 'set-description', description: draft.description });
        dispatch({ type: 'set-level', level: draft.level });
        // Load pokemons: easiest to replay add + set actions. But our reducer
        // doesn't have a bulk-load action, so we call dispatch directly.
        for (const p of draft.pokemons) {
          dispatch({ type: 'add-pokemon', full: p.full });
          dispatch({ type: 'set-ability', slotOrder: p.slotOrder, abilityId: p.abilityId });
          dispatch({ type: 'set-item', slotOrder: p.slotOrder, itemId: p.itemId });
          dispatch({ type: 'set-nature', slotOrder: p.slotOrder, natureId: p.natureId });
          (['h', 'a', 'b', 'c', 'd', 's'] as const).forEach((stat) => {
            dispatch({ type: 'set-ev', slotOrder: p.slotOrder, stat, value: p.evs[stat] });
          });
          for (const m of p.moves) {
            dispatch({
              type: 'set-move',
              slotOrder: p.slotOrder,
              moveSlot: m.slotOrder,
              moveId: m.moveId,
            });
          }
        }
        setAbilities(a.items);
        setItems(i.items);
        setNatures(n.items);
        setLoaded(true);
      } catch {
        if (!cancelled) setSaveError(tEdit('loadError'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loaded, teamId, tEdit]);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(h);
  }, [toast]);

  const canSave = loaded && draftIsValid(state);

  function onPickerAdd(full: PokemonFull) {
    if (picker.kind === 'change') {
      dispatch({ type: 'change-pokemon', slotOrder: picker.slotOrder, full });
    } else {
      dispatch({ type: 'add-pokemon', full });
    }
    setPicker({ kind: 'closed' });
  }

  async function onSave() {
    if (!token) {
      setVerifyOpen(true);
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: UpdateTeamInput = {
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        level: state.level,
        pokemons: state.pokemons.map(toTeamPokemonInput),
      };
      await updateTeam(teamId, payload, { token });
      clearVerifyToken(teamId);
      setToast(tEdit('saved'));
      setTimeout(() => {
        router.push(`/${locale}/teams/${teamId}`);
        router.refresh();
      }, 600);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearVerifyToken(teamId);
        setToken(null);
        setVerifyOpen(true);
        return;
      }
      setSaveError(tEdit('saveError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-20">
      <h1 className="text-[15px] font-semibold mb-2">{tEdit('title')}</h1>

      {!loaded && !verifyOpen && (
        <div className="text-[11px] text-text-tertiary">{tEdit('loading')}</div>
      )}

      {loaded && (
        <>
          <TeamMetaForm
            name={state.name}
            description={state.description}
            level={state.level}
            onName={(name) => dispatch({ type: 'set-name', name })}
            onDescription={(description) =>
              dispatch({ type: 'set-description', description })
            }
            onLevel={(level) => dispatch({ type: 'set-level', level })}
          />

          <div className="flex items-center justify-between mt-3 mb-1.5">
            <span className="text-[11px] font-medium">{t('pokemonSection')}</span>
            <span className="text-[10px] text-text-tertiary tabular-nums">
              {t('pokemonCount', { count: state.pokemons.length })}
            </span>
          </div>

          {state.pokemons.map((p) => (
            <TeamPokemonEditor
              key={p.slotOrder}
              pokemon={p}
              level={state.level}
              abilities={abilities}
              items={items}
              natures={natures}
              onChangeRequest={() =>
                setPicker({ kind: 'change', slotOrder: p.slotOrder })
              }
              onRemove={() =>
                dispatch({ type: 'remove-pokemon', slotOrder: p.slotOrder })
              }
              onSetAbility={(abilityId) =>
                dispatch({
                  type: 'set-ability',
                  slotOrder: p.slotOrder,
                  abilityId,
                })
              }
              onSetItem={(itemId) =>
                dispatch({ type: 'set-item', slotOrder: p.slotOrder, itemId })
              }
              onSetNature={(natureId) =>
                dispatch({ type: 'set-nature', slotOrder: p.slotOrder, natureId })
              }
              onSetEv={(stat, value) =>
                dispatch({
                  type: 'set-ev',
                  slotOrder: p.slotOrder,
                  stat,
                  value,
                })
              }
              onSetMove={(moveSlot, moveId) =>
                dispatch({
                  type: 'set-move',
                  slotOrder: p.slotOrder,
                  moveSlot,
                  moveId,
                })
              }
              onIllegalMovesDetected={(legalMoveIds) => {
                dispatch({
                  type: 'clear-illegal-moves',
                  slotOrder: p.slotOrder,
                  legalMoveIds,
                });
                setToast(t('abilityRippleToast'));
              }}
            />
          ))}

          {state.pokemons.length < 6 && (
            <button
              type="button"
              data-testid="add-pokemon"
              onClick={() => setPicker({ kind: 'add' })}
              className="w-full border border-dashed border-border-tertiary rounded-lg py-2 text-[11px] text-text-secondary min-h-[36px] mb-2"
            >
              {t('addPokemonCount', { count: state.pokemons.length })}
            </button>
          )}

          <div className="sticky bottom-[56px] bg-bg-primary pt-2 pb-2 border-t border-border-tertiary mt-3">
            {saveError && (
              <div className="bg-danger-bg rounded-sm px-2 py-1.5 text-[9px] text-danger-fg leading-snug mb-2">
                {saveError}
              </div>
            )}
            <button
              type="button"
              data-testid="save-changes"
              disabled={!canSave || saving}
              onClick={onSave}
              className="w-full bg-text-primary text-bg-primary rounded-md py-2 text-[12px] font-medium min-h-[44px] disabled:opacity-40"
            >
              {saving ? tEdit('saving') : tEdit('save')}
            </button>
          </div>

          <PokemonPickerModal
            open={picker.kind !== 'closed'}
            onClose={() => setPicker({ kind: 'closed' })}
            onAdd={onPickerAdd}
          />
        </>
      )}

      <PasswordConfirmModal
        open={verifyOpen}
        mode="edit"
        teamId={teamId}
        onClose={() => {
          setVerifyOpen(false);
          router.push(`/${locale}/teams/${teamId}`);
        }}
        onEditReady={(tok) => {
          setToken(tok);
          setVerifyOpen(false);
        }}
        onDeleted={() => setVerifyOpen(false)}
      />

      {toast && (
        <div
          role="status"
          data-testid="toast"
          className="fixed bottom-[70px] left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[11px] px-3 py-1.5 rounded-md shadow-lg z-40"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function toTeamPokemonInput(p: DraftPokemon): TeamPokemonInputRaw {
  if (p.abilityId == null) {
    throw new Error('ability is required');
  }
  return {
    slotOrder: p.slotOrder,
    pokemonId: p.pokemonId,
    abilityId: p.abilityId,
    itemId: p.itemId,
    natureId: p.natureId,
    evs: p.evs,
    ivs: p.ivs,
    teraType: p.teraType,
    moves: p.moves.map((m) => ({
      moveId: m.moveId,
      slotOrder: m.slotOrder,
    })),
  };
}
