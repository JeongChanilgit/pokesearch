'use client';

import { useEffect, useReducer, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  createTeam,
  listItems,
  listNatures,
} from '@pokesearch/api-client';
import type {
  CreateTeamInput,
  Item,
  Nature,
  PokemonFull,
  TeamPokemonInputRaw,
} from '@pokesearch/types';
import { TeamMetaForm } from '../../../../components/TeamMetaForm';
import { TeamPokemonEditor } from '../../../../components/TeamPokemonEditor';
import { PokemonPickerModal } from '../../../../components/PokemonPickerModal';
import { SaveModal } from '../../../../components/SaveModal';
import {
  INITIAL_DRAFT,
  draftReducer,
  draftIsValid,
  type DraftPokemon,
} from '../../../../lib/draft-team';

type PickerMode =
  | { kind: 'closed' }
  | { kind: 'add' }
  | { kind: 'change'; slotOrder: number };

export default function NewTeamPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('create');

  const [state, dispatch] = useReducer(draftReducer, INITIAL_DRAFT);
  const [items, setItems] = useState<Item[]>([]);
  const [natures, setNatures] = useState<Nature[]>([]);
  const [picker, setPicker] = useState<PickerMode>({ kind: 'closed' });
  const [saveOpen, setSaveOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listItems(), listNatures()])
      .then(([i, n]) => {
        if (cancelled) return;
        setItems(i.items);
        setNatures(n.items);
      })
      .catch(() => {
        /* ignore; editor will render empty selects until retry */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const h = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(h);
  }, [toast]);

  const canSave = draftIsValid(state);

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

  async function onConfirmSave(password: string) {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: CreateTeamInput = {
        name: state.name.trim(),
        description: state.description.trim() || undefined,
        level: state.level,
        password,
        pokemons: state.pokemons.map(toTeamPokemonInput),
      };
      const res = await createTeam(payload);
      setSaveOpen(false);
      setToast(t('saved'));
      router.push(`/${locale}/teams/${res.id}`);
    } catch {
      setSaveError(t('errorGeneric'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-4">
      <h1 className="text-[15px] font-semibold mb-2">{t('title')}</h1>

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

      {state.pokemons.length === 0 && (
        <div
          className="border border-dashed border-border-tertiary rounded-lg p-4 text-center mb-1.5"
          data-testid="pokemon-empty"
        >
          <div className="text-[11px] text-text-secondary mb-[2px]">
            {t('noPokemon')}
          </div>
          <div className="text-[9px] text-text-tertiary">
            {t('noPokemonHint')}
          </div>
        </div>
      )}

      {state.pokemons.map((p) => (
        <TeamPokemonEditor
          key={p.slotOrder}
          pokemon={p}
          level={state.level}
          items={items}
          natures={natures}
          onChangeRequest={() =>
            openPicker({ kind: 'change', slotOrder: p.slotOrder })
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
          onClick={() => openPicker({ kind: 'add' })}
          className="w-full border border-dashed border-border-tertiary rounded-lg py-2 text-[11px] text-text-secondary min-h-[36px] mb-2"
        >
          {t('addPokemonCount', { count: state.pokemons.length })}
        </button>
      )}

      <div className="sticky bottom-0 bg-bg-primary pt-2 pb-2 border-t border-border-tertiary mt-3">
        <button
          type="button"
          data-testid="open-save-modal"
          disabled={!canSave}
          onClick={() => {
            setSaveError(null);
            setSaveOpen(true);
          }}
          className="w-full bg-text-primary text-bg-primary rounded-md py-2 text-[12px] font-medium min-h-[44px] disabled:opacity-40"
        >
          {t('save')}
        </button>
      </div>

      <PokemonPickerModal
        open={picker.kind !== 'closed'}
        onClose={() => setPicker({ kind: 'closed' })}
        onAdd={onPickerAdd}
      />

      <SaveModal
        open={saveOpen}
        saving={saving}
        errorMessage={saveError}
        onCancel={() => setSaveOpen(false)}
        onSubmit={onConfirmSave}
      />

      {toast && (
        <div
          role="status"
          data-testid="toast"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-text-primary text-bg-primary text-[11px] px-3 py-1.5 rounded-md shadow-lg z-40"
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
