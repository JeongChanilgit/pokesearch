import {
  ListCommentsRequest,
  ListCommentsResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  DeleteCommentRequest,
} from '@pokesearch/types';
import type {
  ListCommentsInput,
  CreateCommentRequest as CreateCommentInput,
  DeleteCommentRequest as DeleteCommentInput,
} from '@pokesearch/types';
import { request, type ApiClientOptions } from './http';

export async function listComments(
  input: ListCommentsInput,
  opts: ApiClientOptions = {},
): Promise<ListCommentsResponse> {
  const parsed = ListCommentsRequest.parse(input);
  const params = new URLSearchParams();
  params.set('page', String(parsed.page));
  return request(
    `/api/teams/${parsed.teamId}/comments?${params.toString()}`,
    { method: 'GET' },
    opts,
    (data) => ListCommentsResponse.parse(data),
  );
}

export async function createComment(
  input: CreateCommentInput,
  opts: ApiClientOptions = {},
): Promise<CreateCommentResponse> {
  const parsed = CreateCommentRequest.parse(input);
  const { teamId, ...body } = parsed;
  return request(
    `/api/teams/${teamId}/comments`,
    { method: 'POST', body: JSON.stringify(body) },
    opts,
    (data) => CreateCommentResponse.parse(data),
  );
}

export async function deleteComment(
  input: DeleteCommentInput,
  opts: ApiClientOptions = {},
): Promise<void> {
  const parsed = DeleteCommentRequest.parse(input);
  const { commentId, password } = parsed;
  await request(
    `/api/comments/${commentId}`,
    { method: 'DELETE', body: JSON.stringify({ password }) },
    opts,
    () => undefined,
  );
}
