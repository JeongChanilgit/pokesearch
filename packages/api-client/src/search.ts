import {
  QuickSearchRequest,
  QuickSearchResponse,
  SuggestPokemonRequest,
  SuggestPokemonResponse,
} from '@pokesearch/types';
import type {
  QuickSearchInput,
  SuggestPokemonInput,
} from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function quickSearch(
  input: QuickSearchInput,
  opts: ApiClientOptions = {},
): Promise<QuickSearchResponse> {
  const parsed = QuickSearchRequest.parse(input);
  const params = new URLSearchParams();
  params.set('q', parsed.q);
  params.set('level', String(parsed.level));
  return request(
    `/api/search?${params.toString()}`,
    { method: 'GET' },
    opts,
    (data) => QuickSearchResponse.parse(data),
  );
}

export async function suggestPokemon(
  input: SuggestPokemonInput,
  opts: ApiClientOptions = {},
): Promise<SuggestPokemonResponse> {
  const parsed = SuggestPokemonRequest.parse(input);
  const params = new URLSearchParams();
  params.set('q', parsed.q);
  params.set('limit', String(parsed.limit));
  return request(
    `/api/search/suggest?${params.toString()}`,
    { method: 'GET' },
    opts,
    (data) => SuggestPokemonResponse.parse(data),
  );
}
