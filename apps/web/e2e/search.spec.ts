import { test, expect } from '@playwright/test';

test.describe('Quick Search', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('english query resolves to english name + psychic type', async ({ page }) => {
    await page.goto('/en/search?q=Reuniclus');
    await expect(page.getByRole('heading', { name: 'Quick Search' })).toBeVisible();
    await expect(page.getByText(/Reuniclus/i).first()).toBeVisible();
    await expect(page.getByText(/Psychic/i).first()).toBeVisible();
  });

  test('korean query displays korean header', async ({ page }) => {
    await page.goto('/ko/search?q=%EB%A6%AC%EC%9E%90%EB%AA%BD'); // 리자몽
    await expect(page.getByText('리자몽').first()).toBeVisible();
  });

  test('korean name works when locale is english', async ({ page }) => {
    await page.goto('/en/search?q=%EB%A6%AC%EC%9E%90%EB%AA%BD'); // 리자몽
    // English header for Charizard should render even though the query was Korean.
    await expect(page.getByText('Charizard').first()).toBeVisible();
  });

  test('changing level from 50 to 100 updates stats', async ({ page }) => {
    await page.goto('/en/search?q=Reuniclus&level=50');
    const firstNorm = await page
      .locator('.text-norm-fg')
      .first()
      .innerText();

    await page.getByRole('button', { name: '100' }).click();
    await page.waitForURL(/level=100/);

    const newNorm = await page
      .locator('.text-norm-fg')
      .first()
      .innerText();
    expect(newNorm).not.toBe(firstNorm);
  });

  test('unknown query shows not-found state', async ({ page }) => {
    await page.goto('/en/search?q=Zzzzzzz');
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
