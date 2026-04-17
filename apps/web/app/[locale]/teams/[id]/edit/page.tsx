'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  getTeam,
  listAbilities,
  listItems,
  listNatures,
  updateTeam,
  ApiError,
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
  readVerifyToken,
  saveVerifyToken,
} from '../../../../../lib/verify-token-store';

type PickerMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'change'; slotOrder: number };

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const teamId = params?.id as string;
  const t = useTranslations('create');
  const tEdit = useTranslations('edit');

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reVerifyOpen, setReVerifyOpen] = useState(false);

  const [state, dispatch] = useReducer(draftReducer, INITIAL_DRAFT);
  const [initialized, setInitialized] = useState(false);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [picker, setPicker] = useState<PickerMode>({ kind: 'closed' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const initRef = useRef(false);

  // Load verify token from sessionStorage; if missing, open verify modal.
  useEffect(() => {
    if (!teamId) return;
    const stored = readVerifyToken(teamId);
    if (!stored) {
      setReVerifyOpen(true);
      setLoading(false);
      return;
    }
    setToken(stored.token);
  }, [teamId]);

  // Load team + master data once we have a token.
  useEffect(() => {
    if (!teamId || !token || initRef.current) return;
    initRef.current = true;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getTeam(teamId),
      listAbilities(),
      listItems(),
      listNatures(),
    ])
      .then(([team, a, i, n]) => {
        if (cancelled) return;
        setAbilities(a.items);
        setItems(i.items);
        setNatures(n.items);
        const draft = teamDetailToDraft(team);
        // Replace reducer state by dispatching actions that rebuild it.
        dispatch({ type: 'set-name', name: draft.name });
        dispatch({ type: 'set-description', description: draft.description });
        dispatch({ type: 'set-level', level: draft.level });
        // Seed pokemons manually by pushing raw state via a custom path:
        // easiest approach = replace state entirely. Since the reducer
        // doesn't support wholesale replace, we dispatch add actions and then
        // patch each. To keep things simple, we use the escape hatch below.
        for (const p of draft.pokemons) {
          dispatch({ type: 'add-pokemon', full: p.full });
        }
        // Defer detail patching to a follow-up effect once adds settle.
        setPreloadedPokemons(draft.pokemons);
        setInitialized(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(tEdit('loadError'));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [teamId, token, tEdit]);

  // After add-pokemon actions settle, patch each slot with the saved config.
  const [preloadedPokemons, setPreloadedPokemons] = useState<DraftPokemon[] | null>(
    null,
  );
  useEffect(() => {
    if (!preloadedPokemons || state.pokemons.length !== preloadedPokemons.length) {
      return;
    }
    // state.pokemons are sorted by slotOrder 1..N; preloadedPokemons same order.
    for (let i = 0; i < preloadedPokemons.length; i += 1) {
      const src = preloadedPokemons[i]!;
      const slot = state.pokemons[i]!.slotOrder;
      dispatch({ type: 'set-ability', slotOrder: slot, abilityId: src.abilityId });
      dispatch({ type: 'set-item', slotOrder: slot, itemId: src.itemId });
      dispatch({ type: 'set-nature', slotOrder: slot, natureId: src.natureId });
      (['h', 'a', 'b', 'c', 'd', 's'] as const).forEach((k) => {
        dispatch({ type: 'set-ev', slotOrder: slot, stat: k, value: src.evs[k] });
      });
      src.moves.forEach((m) => {
        dispatch({
          type: 'set-move',
          slotOrder: slot,
          moveSlot: m.slotOrder,
          moveId: m.moveId,
        });
      });
    }
    setPreloadedPokemons(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedPokemons, state.pokemons.length]);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(h);
  }, [toast]);

  const canSave = initialized && draftIsValid(state);

  function openPicker(mode: PickerMode) {
    setPicker(mode);
  }

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
      setReVerifyOpen(true);
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
      router.push(`/${locale}/teams/${teamId}`);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearVerifyToken(teamId);
        setToken(null);
        setReVerifyOpen(true);
        setSaveError(tEdit('tokenExpired'));
      } else {
        setSaveError(tEdit('errorGeneric'));
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading && !reVerifyOpen) {
    return <div className="text-[11px] text-text-secondary">{tEdit('loading')}</div>;
  }

  if (loadError) {
    return (
      <div className="text-[11px] text-danger-fg" role="alert">
        {loadError}
      </div>
    );
  }

  return (
    <div className="pb-20">
      <h1 className="text-[15px] font-semibold mb-2">{tEdit('title')}</h1>

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
            openPicker({ kind: 'change', slotOrder: p.slotOrder })
          }
          onRemove={() =>
            dispatch({ type: 'remove-pokemon', slotOrder: p.slotOrder })
          }
          onSetAbility={(abilityId) =>
            dispatch({ type: 'set-ability', slotOrder: p.slotOrder, abilityId })
          }
          onSetItem={(itemId) =>
            dispatch({ type: 'set-item', slotOrder: p.slotOrder, itemId })
          }
          onSetNature={(natureId) =>
            dispatch({ type: 'set-nature', slotOrder: p.slotOrder, natureId })
          }
          onSetEv={(stat, value) =>
            dispatch({ type: 'set-ev', slotOrder: p.slotOrder, stat, value })
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
          onClick={() => openPicker({ kind: 'add' })}
          className="w-full border border-dashed border-border-tertiary rounded-lg py-2 text-[11px] text-text-secondary min-h-[36px] mb-2"
        >
          {t('addPokemonCount', { count: state.pokemons.length })}
        </button>
      )}

      <div className="sticky bottom-[56px] bg-bg-primary pt-2 pb-2 border-t border-border-tertiary mt-3">
        <button
          type="button"
          data-testid="save-edit"
          disabled={!canSave || saving}
          onClick={() => void onSave()}
          className="w-full bg-text-primary text-bg-primary rounded-md py-2 text-[12px] font-medium min-h-[44px] disabled:opacity-40"
        >
          {saving ? tEdit('saving') : tEdit('save')}
        </button>
        {saveError && (
          <div
            className="mt-1.5 bg-danger-bg text-danger-fg text-[10px] rounded-sm px-2 py-1"
            role="alert"
            data-testid="edit-save-error"
          >
            {saveError}
          </div>
        )}
      </div>

      <PokemonPickerModal
        open={picker.kind !== 'closed'}
        onClose={() => setPicker({ kind: 'closed' })}
        onAdd={onPickerAdd}
      />

      <PasswordConfirmModal
        open={reVerifyOpen}
        mode="edit"
        teamId={teamId}
        onCancel={() => {
          setReVerifyOpen(false);
          router.push(`/${locale}/teams/${teamId}`);
        }}
        onEditSuccess={(tok, expiresAt) => {
          saveVerifyToken(teamId, tok, expiresAt);
          setToken(tok);
          setReVerifyOpen(false);
          initRef.current = false;
          setInitialized(false);
        }}
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

function teamDetailToDraft(team: TeamDetail): DraftTeam {
  return {
    name: team.name,
    description: team.description ?? '',
    level: team.level,
    pokemons: team.pokemons.map((tp) => {
      const full: PokemonFull = {
        id: tp.pokemon.id,
        nameEn: tp.pokemon.nameEn,
        nameKo: tp.pokemon.nameKo,
        types: tp.pokemon.types,
        spriteUrl: tp.pokemon.spriteUrl,
        baseH: tp.pokemon.baseH,
        baseA: tp.pokemon.baseA,
        baseB: tp.pokemon.baseB,
        baseC: tp.pokemon.baseC,
        baseD: tp.pokemon.baseD,
        baseS: tp.pokemon.baseS,
        formOf: null,
      };
      return {
        slotOrder: tp.slotOrder,
        pokemonId: tp.pokemon.id,
        full,
        abilityId: tp.ability.id,
        itemId: tp.item?.id ?? null,
        natureId: tp.nature.id,
        evs: { ...tp.evs },
        ivs: tp.ivs ? { ...tp.ivs } : { ...DEFAULT_IVS },
        moves: tp.moves.map((m) => ({
          moveId: m.move.id,
          slotOrder: m.slotOrder,
        })),
        teraType: tp.teraType,
      };
    }),
  };
}
