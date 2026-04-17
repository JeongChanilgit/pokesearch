import {
  UuidSchema,
  LikeStatusResponse,
  LikeMutationResponse,
} from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function getLikeStatus(
  teamId: string,
  opts: ApiClientOptions = {},
): Promise<LikeStatusResponse> {
  UuidSchema.parse(teamId);
  return request(
    `/api/teams/${teamId}/likes/me`,
    { method: 'GET' },
    opts,
    (data) => LikeStatusResponse.parse(data),
  );
}

export async function addLike(
  teamId: string,
  opts: ApiClientOptions = {},
): Promise<LikeMutationResponse> {
  UuidSchema.parse(teamId);
  return request(
    `/api/teams/${teamId}/likes`,
    { method: 'POST' },
    opts,
    (data) => LikeMutationResponse.parse(data),
  );
}

export async function removeLike(
  teamId: string,
  opts: ApiClientOptions = {},
): Promise<LikeMutationResponse> {
  UuidSchema.parse(teamId);
  return request(
    `/api/teams/${teamId}/likes`,
    { method: 'DELETE' },
    opts,
    (data) => LikeMutationResponse.parse(data),
  );
}
