import { test, expect } from '@playwright/test';

// Slice 6 smoke — requires the sample-teams seed to have run. Skipped when
// the DB is empty so local runs without seed still pass.

test.describe('team list + detail', () => {
  test('EN: home renders seeded teams and detail navigation works', async ({ page }) => {
    await page.goto('/en');

    const cards = page.getByTestId('team-card');
    const count = await cards.count();
    test.skip(count === 0, 'seed empty — run pnpm db:seed to enable');

    await expect(cards.first()).toBeVisible();
    await cards.first().click();

    await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/);
    await expect(page.getByTestId('team-name')).toBeVisible();
    const pokemonCards = page.getByTestId('team-pokemon-card');
    await expect(pokemonCards.first()).toBeVisible();
    expect(await pokemonCards.count()).toBeGreaterThan(0);

    await page.goBack();
    await expect(page).toHaveURL(/\/en\/?(\?.*)?$/);
  });

  test('KO: locale toggle preserves page state', async ({ page }) => {
    await page.goto('/en');
    const first = page.getByTestId('team-card').first();
    const hasAny = await first.count();
    test.skip(hasAny === 0, 'seed empty');

    await page.getByLabel('Toggle language').click();
    await expect(page).toHaveURL(/\/ko(\/.*)?$/);
    await expect(page.getByTestId('team-card').first()).toBeVisible();
  });

  test('no broken sprite images on home or team detail', async ({ page }) => {
    await page.goto('/en');

    const cards = page.getByTestId('team-card');
    const count = await cards.count();
    test.skip(count === 0, 'seed empty — run pnpm db:seed to enable');

    // Wait for lazy-loaded sprites to settle.
    await page.waitForLoadState('networkidle');

    const homeBroken = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return imgs
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src);
    });
    expect(homeBroken, `Broken images on /en: ${homeBroken.join(', ')}`).toEqual(
      [],
    );

    await cards.first().click();
    await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/);
    await page.waitForLoadState('networkidle');

    const detailBroken = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')];
      return imgs
        .filter((i) => i.complete && i.naturalWidth === 0)
        .map((i) => i.src);
    });
    expect(
      detailBroken,
      `Broken images on team detail: ${detailBroken.join(', ')}`,
    ).toEqual([]);
  });
});
