import { test, expect } from '@playwright/test';

// Slice 7 smoke — requires master-data seed (pokemon/abilities/items/natures).
// Skips gracefully if the picker returns no Pokémon.

test.describe('create team', () => {
  test('save button is disabled without name or pokemon', async ({ page }) => {
    await page.goto('/en/teams/new');
    const saveBtn = page.getByTestId('open-save-modal');
    await expect(saveBtn).toBeDisabled();

    await page.getByTestId('team-name-input').fill('Test team');
    await expect(saveBtn).toBeDisabled();
  });

  test('empty team name blocks SaveModal from opening', async ({ page }) => {
    await page.goto('/en/teams/new');

    // Button must be disabled when name is empty.
    const saveBtn = page.getByTestId('open-save-modal');
    await expect(saveBtn).toBeDisabled();

    // Validation hint should appear explaining the missing name.
    await expect(page.getByTestId('save-validation-hint')).toBeVisible();

    // SaveModal must NOT open despite any attempt to click the disabled button.
    await saveBtn.dispatchEvent('click');
    await expect(page.getByTestId('save-modal')).not.toBeVisible();

    // Filling the name alone still leaves the button disabled (no Pokémon yet).
    await page.getByTestId('team-name-input').fill('My Team');
    await expect(saveBtn).toBeDisabled();
    await expect(page.getByTestId('save-validation-hint')).toBeVisible();
  });

  test('happy path: fill meta, add pokemon, save redirects to detail', async ({
    page,
  }) => {
    await page.goto('/en/teams/new');

    await page.getByTestId('team-name-input').fill('Playwright team');
    await page.getByTestId('team-desc-input').fill('via e2e');

    await page.getByTestId('add-pokemon').click();
    await expect(page.getByTestId('picker-modal')).toBeVisible();

    const list = page.getByTestId('picker-list');
    const firstBtn = list.getByRole('button').first();
    // Wait for the async pokemon list to populate (or time out → treat as empty seed).
    const hasAny = await firstBtn
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!hasAny, 'seed empty — run pnpm db:seed');

    await firstBtn.click();
    await page.getByTestId('picker-add').click();
    await expect(page.getByTestId('pokemon-editor')).toBeVisible();

    const saveBtn = page.getByTestId('open-save-modal');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await expect(page.getByTestId('save-modal')).toBeVisible();
    await page.getByTestId('password-input').fill('secret123');
    await page.getByTestId('password-confirm-input').fill('mismatch');
    await page.getByTestId('save-modal-confirm').click();
    await expect(page.getByTestId('save-modal-error')).toBeVisible();

    await page.getByTestId('password-confirm-input').fill('secret123');
    await page.getByTestId('save-modal-confirm').click();

    await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/, {
      timeout: 15000,
    });
  });
});
