import { describe, test, expect, vi } from 'vitest';
import { createApiClient } from '../src/client';

function mockOkJson(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

describe('createApiClient', () => {
  test('uses provided baseUrl', async () => {
    const fetchFn = mockOkJson({ items: [], nextCursor: null });
    const api = createApiClient({
      baseUrl: 'https://pokesearch.example',
      fetchFn: fetchFn as unknown as typeof fetch,
    });
    await api.listTeams();
    const [url] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url.startsWith('https://pokesearch.example/api/teams')).toBe(true);
  });

  test('forwards locale header to every call', async () => {
    const fetchFn = mockOkJson({ pokemon: null, moves: [] });
    const api = createApiClient({
      fetchFn: fetchFn as unknown as typeof fetch,
      locale: 'ko',
    });
    await api.quickSearch({ q: 'Pikachu' });
    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual(
      expect.objectContaining({ 'Accept-Language': 'ko' }),
    );
  });

  test('forwards Authorization header when token set', async () => {
    const fetchFn = mockOkJson({ items: [], nextCursor: null });
    const api = createApiClient({
      fetchFn: fetchFn as unknown as typeof fetch,
      token: 'jwt-abc',
    });
    await api.listTeams();
    const [, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual(
      expect.objectContaining({ Authorization: 'Bearer jwt-abc' }),
    );
  });

  test('defaults fetch to globalThis.fetch when not provided', () => {
    const api = createApiClient();
    expect(typeof api.quickSearch).toBe('function');
  });
});
