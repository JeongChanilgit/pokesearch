import { describe, test, expect, vi } from 'vitest';
import { quickSearch, suggestPokemon } from '../src/search';
import { ApiError } from '../src/errors';

function mockOkJson(body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

function mockErrJson(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

describe('quickSearch', () => {
  test('forwards locale header and query string', async () => {
    const fetchFn = mockOkJson({ pokemon: null, moves: [] });
    await quickSearch(
      { q: 'Reuniclus' },
      { fetchFn: fetchFn as unknown as typeof fetch, locale: 'en' },
    );
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining('/api/search?q=Reuniclus'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Accept-Language': 'en' }),
      }),
    );
  });

  test('sends level parameter', async () => {
    const fetchFn = mockOkJson({ pokemon: null, moves: [] });
    await quickSearch(
      { q: 'Pikachu', level: 100 },
      { fetchFn: fetchFn as unknown as typeof fetch },
    );
    const [url] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('level=100');
  });

  test('rejects invalid input with ZodError', async () => {
    const fetchFn = vi.fn();
    await expect(
      quickSearch(
        { q: '' },
        { fetchFn: fetchFn as unknown as typeof fetch },
      ),
    ).rejects.toThrow();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  test('throws ApiError on non-ok response', async () => {
    const fetchFn = mockErrJson(404, {
      error: { code: 'NOT_FOUND', message: 'Pokémon not found' },
    });
    await expect(
      quickSearch(
        { q: 'Unknowable' },
        { fetchFn: fetchFn as unknown as typeof fetch },
      ),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'NOT_FOUND',
      message: 'Pokémon not found',
    });
  });

  test('throws ApiError with UNKNOWN code when body is not standard', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as unknown as Response);
    const err = await quickSearch(
      { q: 'Reuniclus' },
      { fetchFn: fetchFn as unknown as typeof fetch },
    ).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(500);
    expect(err.code).toBe('UNKNOWN');
  });

  test('throws when response schema does not match', async () => {
    const fetchFn = mockOkJson({ unexpected: true });
    await expect(
      quickSearch(
        { q: 'Reuniclus' },
        { fetchFn: fetchFn as unknown as typeof fetch },
      ),
    ).rejects.toThrow();
  });
});

describe('suggestPokemon', () => {
  test('happy path returns parsed items', async () => {
    const fetchFn = mockOkJson({
      items: [
        {
          id: 2500,
          nameEn: 'Pikachu',
          nameKo: '피카츄',
          spriteUrl: 'https://example.com/pikachu.png',
        },
      ],
    });
    const res = await suggestPokemon(
      { q: 'pika' },
      { fetchFn: fetchFn as unknown as typeof fetch },
    );
    expect(res.items).toHaveLength(1);
    expect(res.items[0].nameEn).toBe('Pikachu');
  });
});
