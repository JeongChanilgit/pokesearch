import {
  ListTeamsRequest,
  ListTeamsResponse,
  CreateTeamRequest,
  CreateTeamResponse,
  TeamDetail,
  UpdateTeamRequest,
  VerifyTeamPasswordRequest,
  VerifyTeamPasswordResponse,
  UuidSchema,
} from '@pokesearch/types';
import type {
  ListTeamsInput,
  CreateTeamInput,
  UpdateTeamInput,
  VerifyTeamPasswordRequest as VerifyTeamPasswordInput,
} from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function listTeams(
  input: ListTeamsInput = {},
  opts: ApiClientOptions = {},
): Promise<ListTeamsResponse> {
  const parsed = ListTeamsRequest.parse(input);
  const params = new URLSearchParams();
  params.set('sort', parsed.sort);
  params.set('limit', String(parsed.limit));
  if (parsed.pokemonId !== undefined) {
    params.set('pokemonId', String(parsed.pokemonId));
  }
  if (parsed.cursor) params.set('cursor', parsed.cursor);
  return request(
    `/api/teams?${params.toString()}`,
    { method: 'GET' },
    opts,
    (data) => ListTeamsResponse.parse(data),
  );
}

export async function getTeam(
  id: string,
  opts: ApiClientOptions = {},
): Promise<TeamDetail> {
  UuidSchema.parse(id);
  return request(
    `/api/teams/${id}`,
    { method: 'GET' },
    opts,
    (data) => TeamDetail.parse(data),
  );
}

export async function createTeam(
  input: CreateTeamInput,
  opts: ApiClientOptions = {},
): Promise<CreateTeamResponse> {
  const parsed = CreateTeamRequest.parse(input);
  return request(
    `/api/teams`,
    { method: 'POST', body: JSON.stringify(parsed) },
    opts,
    (data) => CreateTeamResponse.parse(data),
  );
}

export async function updateTeam(
  id: string,
  input: UpdateTeamInput,
  opts: ApiClientOptions = {},
): Promise<TeamDetail> {
  UuidSchema.parse(id);
  const parsed = UpdateTeamRequest.parse(input);
  return request(
    `/api/teams/${id}`,
    { method: 'PUT', body: JSON.stringify(parsed) },
    opts,
    (data) => TeamDetail.parse(data),
  );
}

export async function deleteTeam(
  id: string,
  opts: ApiClientOptions = {},
): Promise<void> {
  UuidSchema.parse(id);
  await request(
    `/api/teams/${id}`,
    { method: 'DELETE' },
    opts,
    () => undefined,
  );
}

export async function verifyTeamPassword(
  id: string,
  input: VerifyTeamPasswordInput,
  opts: ApiClientOptions = {},
): Promise<VerifyTeamPasswordResponse> {
  UuidSchema.parse(id);
  const parsed = VerifyTeamPasswordRequest.parse(input);
  return request(
    `/api/teams/${id}/verify`,
    { method: 'POST', body: JSON.stringify(parsed) },
    opts,
    (data) => VerifyTeamPasswordResponse.parse(data),
  );
}
