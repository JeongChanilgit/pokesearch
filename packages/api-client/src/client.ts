import type {
  CreateTeamInput,
  ListTeamsInput,
  UpdateTeamInput,
  VerifyTeamPasswordRequest,
  ListCommentsInput,
  CreateCommentRequest,
  DeleteCommentRequest,
  QuickSearchInput,
  SuggestPokemonInput,
  ListPokemonsInput,
  GetPokemonMovesRequest,
  GetPokemonRequest,
  ListAbilitiesInput,
} from '@pokesearch/types';
import type { ApiClientOptions } from './http';
import { quickSearch, suggestPokemon } from './search';
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  verifyTeamPassword,
} from './teams';
import { listComments, createComment, deleteComment } from './comments';
import { addLike, removeLike, getLikeStatus } from './likes';
import { listPokemons, getPokemonMoves, getPokemon } from './pokemons';
import { listAbilities, listItems, listNatures } from './abilities';

/**
 * Bind ApiClientOptions once and get a ready-to-call object of endpoints.
 * The same factory works in Next.js server components, browser, and React
 * Native — pass whichever fetch + baseUrl is appropriate.
 */
export function createApiClient(opts: ApiClientOptions = {}) {
  return {
    quickSearch: (input: QuickSearchInput) => quickSearch(input, opts),
    suggestPokemon: (input: SuggestPokemonInput) => suggestPokemon(input, opts),

    listTeams: (input?: ListTeamsInput) => listTeams(input, opts),
    getTeam: (id: string) => getTeam(id, opts),
    createTeam: (input: CreateTeamInput) => createTeam(input, opts),
    updateTeam: (id: string, input: UpdateTeamInput) =>
      updateTeam(id, input, opts),
    deleteTeam: (id: string) => deleteTeam(id, opts),
    verifyTeamPassword: (id: string, input: VerifyTeamPasswordRequest) =>
      verifyTeamPassword(id, input, opts),

    listComments: (input: ListCommentsInput) => listComments(input, opts),
    createComment: (input: CreateCommentRequest) => createComment(input, opts),
    deleteComment: (input: DeleteCommentRequest) => deleteComment(input, opts),

    getLikeStatus: (teamId: string) => getLikeStatus(teamId, opts),
    addLike: (teamId: string) => addLike(teamId, opts),
    removeLike: (teamId: string) => removeLike(teamId, opts),

    listPokemons: (input?: ListPokemonsInput) => listPokemons(input, opts),
    getPokemon: (input: GetPokemonRequest) => getPokemon(input, opts),
    getPokemonMoves: (input: GetPokemonMovesRequest) =>
      getPokemonMoves(input, opts),

    listAbilities: (input?: ListAbilitiesInput) => listAbilities(input, opts),
    listItems: () => listItems(opts),
    listNatures: () => listNatures(opts),
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
