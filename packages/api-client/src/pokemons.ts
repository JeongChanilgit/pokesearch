import {
  ListPokemonsRequest,
  ListPokemonsResponse,
  GetPokemonMovesRequest,
  GetPokemonMovesResponse,
  GetPokemonRequest,
  GetPokemonResponse,
} from '@pokesearch/types';
import type { ListPokemonsInput } from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function getPokemon(
  input: GetPokemonRequest,
  opts: ApiClientOptions = {},
): Promise<GetPokemonResponse> {
  const parsed = GetPokemonRequest.parse(input);
  return request(
    `/api/pokemons/${parsed.pokemonId}`,
    { method: 'GET' },
    opts,
    (data) => GetPokemonResponse.parse(data),
  );
}

export async function listPokemons(
  input: ListPokemonsInput = {},
  opts: ApiClientOptions = {},
): Promise<ListPokemonsResponse> {
  const parsed = ListPokemonsRequest.parse(input);
  const params = new URLSearchParams();
  if (parsed.q) params.set('q', parsed.q);
  params.set('limit', String(parsed.limit));
  if (parsed.cursor !== undefined) {
    params.set('cursor', String(parsed.cursor));
  }
  return request(
    `/api/pokemons?${params.toString()}`,
    { method: 'GET' },
    opts,
    (data) => ListPokemonsResponse.parse(data),
  );
}

export async function getPokemonMoves(
  input: GetPokemonMovesRequest,
  opts: ApiClientOptions = {},
): Promise<GetPokemonMovesResponse> {
  const parsed = GetPokemonMovesRequest.parse(input);
  return request(
    `/api/pokemons/${parsed.pokemonId}/moves`,
    { method: 'GET' },
    opts,
    (data) => GetPokemonMovesResponse.parse(data),
  );
}
