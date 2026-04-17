import { test, expect, type Page } from '@playwright/test';

const PASSWORD = 'secret123';

async function createTeam(page: Page, name: string): Promise<string> {
  await page.goto('/en/teams/new');
  await page.getByTestId('team-name-input').fill(name);

  await page.getByTestId('add-pokemon').click();
  const list = page.getByTestId('picker-list');
  const firstBtn = list.getByRole('button').first();
  const hasAny = await firstBtn.count();
  if (hasAny === 0) {
    test.skip(true, 'seed empty — run pnpm db:seed');
  }
  await firstBtn.click();
  await page.getByTestId('picker-add').click();
  await expect(page.getByTestId('pokemon-editor')).toBeVisible();

  await page.getByTestId('open-save-modal').click();
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('password-confirm-input').fill(PASSWORD);
  await page.getByTestId('save-modal-confirm').click();

  await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/, {
    timeout: 15000,
  });
  const match = page.url().match(/teams\/([0-9a-f-]{36})$/);
  if (!match) throw new Error('Could not extract team id from URL');
  return match[1];
}

test.describe('edit + delete team', () => {
  test('wrong password shows inline error, no navigation', async ({ page }) => {
    const id = await createTeam(page, 'Wrong-pw team');

    await page.getByTestId('team-edit-button').click();
    const modal = page.getByTestId('password-confirm-modal');
    await expect(modal).toBeVisible();

    await page.getByTestId('confirm-password-input').fill('not-the-password');
    await page.getByTestId('password-confirm-submit').click();

    await expect(page.getByTestId('password-confirm-error')).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/en/teams/${id}$`));
  });

  test('edit flow: verify, change name, save, detail shows new name', async ({
    page,
  }) => {
    const id = await createTeam(page, 'Before rename');

    await page.getByTestId('team-edit-button').click();
    await page.getByTestId('confirm-password-input').fill(PASSWORD);
    await page.getByTestId('password-confirm-submit').click();

    await expect(page).toHaveURL(new RegExp(`/en/teams/${id}/edit$`), {
      timeout: 10000,
    });

    await expect(page.getByTestId('team-name-input')).toHaveValue(
      'Before rename',
    );

    await page.getByTestId('team-name-input').fill('After rename');
    await page.getByTestId('save-changes').click();

    await expect(page).toHaveURL(new RegExp(`/en/teams/${id}$`), {
      timeout: 15000,
    });
    await expect(page.getByTestId('team-name')).toHaveText('After rename');
  });

  test('delete flow: verify, team removed, redirects home', async ({ page }) => {
    const id = await createTeam(page, 'Delete me');

    await page.getByTestId('team-delete-button').click();
    await page.getByTestId('confirm-password-input').fill(PASSWORD);
    await page.getByTestId('password-confirm-submit').click();

    await expect(page).toHaveURL(/\/en$/, { timeout: 15000 });

    const check = await page.request.get(`/api/teams/${id}`);
    expect(check.status()).toBe(404);
  });
});
