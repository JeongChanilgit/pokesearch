import {
  ListAbilitiesRequest,
  ListAbilitiesResponse,
  ListItemsResponse,
  ListNaturesResponse,
} from '@pokesearch/types';
import type { ListAbilitiesInput } from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function listAbilities(
  input: ListAbilitiesInput = {},
  opts: ApiClientOptions = {},
): Promise<ListAbilitiesResponse> {
  const parsed = ListAbilitiesRequest.parse(input);
  const params = new URLSearchParams();
  if (parsed.pokemonId !== undefined) {
    params.set('pokemonId', String(parsed.pokemonId));
  }
  const qs = params.toString();
  return request(
    `/api/abilities${qs ? `?${qs}` : ''}`,
    { method: 'GET' },
    opts,
    (data) => ListAbilitiesResponse.parse(data),
  );
}

export async function listItems(
  opts: ApiClientOptions = {},
): Promise<ListItemsResponse> {
  return request(
    `/api/items`,
    { method: 'GET' },
    opts,
    (data) => ListItemsResponse.parse(data),
  );
}

export async function listNatures(
  opts: ApiClientOptions = {},
): Promise<ListNaturesResponse> {
  return request(
    `/api/natures`,
    { method: 'GET' },
    opts,
    (data) => ListNaturesResponse.parse(data),
  );
}
