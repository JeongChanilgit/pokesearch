import { ApiErrorBody } from '@pokesearch/types';
import type { ApiErrorCode } from '@pokesearch/types';

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode | 'UNKNOWN';
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    const parsed = ApiErrorBody.safeParse(body);
    const resolvedCode = parsed.success ? parsed.data.error.code : 'UNKNOWN';
    const resolvedMessage =
      message ??
      (parsed.success ? parsed.data.error.message : `API error ${status}`);
    super(resolvedMessage);
    this.name = 'ApiError';
    this.status = status;
    this.code = resolvedCode;
    this.body = body;
  }
}
