import type { Locale } from '@pokesearch/types';
import { ApiError } from './errors';

export interface ApiClientOptions {
  /** Defaults to '' (same-origin). Set on React Native to absolute origin. */
  baseUrl?: string;
  /** Defaults to globalThis.fetch. */
  fetchFn?: typeof fetch;
  /** Forwarded as Accept-Language header. */
  locale?: Locale;
  /** Forwarded as Authorization: Bearer <token>. Used for edit/delete routes. */
  token?: string;
}

export interface RequestInitLite {
  method?: string;
  body?: string;
}

export async function request<T>(
  path: string,
  init: RequestInitLite,
  opts: ApiClientOptions,
  parse: (data: unknown) => T,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.locale) headers['Accept-Language'] = opts.locale;
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;
  if (init.body != null) headers['Content-Type'] = 'application/json';

  const baseUrl = opts.baseUrl ?? '';
  const url = baseUrl ? `${baseUrl}${path}` : path;
  const fetchFn = opts.fetchFn ?? globalThis.fetch;

  const res = await fetchFn(url, {
    method: init.method ?? 'GET',
    headers,
    body: init.body,
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      const text = await res.text();
      if (text) {
        try {
          body = JSON.parse(text);
        } catch {
          body = text;
        }
      }
    } catch {
      body = null;
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) {
    return parse(null);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return parse(data);
}
