import { test, expect, type Page } from '@playwright/test';

// Slice 8 smoke — creates a team, then exercises edit+delete password flows.
// Depends on master-data seed; skips gracefully when the picker is empty.

const PASSWORD = 'slice8pass';

async function createTeam(page: Page, teamName: string): Promise<string | null> {
  await page.goto('/en/teams/new');
  await page.getByTestId('team-name-input').fill(teamName);

  await page.getByTestId('add-pokemon').click();
  await expect(page.getByTestId('picker-modal')).toBeVisible();
  const list = page.getByTestId('picker-list');
  const firstBtn = list.getByRole('button').first();
  try {
    await firstBtn.waitFor({ state: 'visible', timeout: 5000 });
  } catch {
    return null;
  }
  await firstBtn.click();
  await page.getByTestId('picker-add').click();
  await expect(page.getByTestId('pokemon-editor')).toBeVisible();

  await page.getByTestId('open-save-modal').click();
  await page.getByTestId('password-input').fill(PASSWORD);
  await page.getByTestId('password-confirm-input').fill(PASSWORD);
  await page.getByTestId('save-modal-confirm').click();

  await page.waitForURL(/\/en\/teams\/[0-9a-f-]{36}$/, { timeout: 15000 });
  const url = page.url();
  const match = /\/teams\/([0-9a-f-]{36})$/.exec(url);
  return match ? match[1]! : null;
}

test.describe('edit / delete team', () => {
  test('wrong password shows error and does not navigate', async ({ page }) => {
    const id = await createTeam(page, 'E2E edit wrong pw');
    test.skip(id === null, 'seed empty — run pnpm db:seed');

    await page.getByTestId('team-edit').click();
    await expect(page.getByTestId('verify-modal-edit')).toBeVisible();
    await page.getByTestId('verify-password-input').fill('wrong-password');
    await page.getByTestId('verify-modal-confirm').click();

    await expect(page.getByTestId('verify-modal-error')).toBeVisible();
    await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/);
  });

  test('correct password redirects to edit page, save updates name', async ({
    page,
  }) => {
    const id = await createTeam(page, 'E2E edit happy');
    test.skip(id === null, 'seed empty — run pnpm db:seed');

    await page.getByTestId('team-edit').click();
    await page.getByTestId('verify-password-input').fill(PASSWORD);
    await page.getByTestId('verify-modal-confirm').click();

    await page.waitForURL(new RegExp(`/en/teams/${id}/edit$`), {
      timeout: 15000,
    });

    const nameInput = page.getByTestId('team-name-input');
    await expect(nameInput).toHaveValue('E2E edit happy');
    await nameInput.fill('E2E edit happy v2');
    const saveBtn = page.getByTestId('save-edit');
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    await page.waitForURL(new RegExp(`/en/teams/${id}$`), { timeout: 15000 });
    await expect(page.getByTestId('team-name')).toHaveText('E2E edit happy v2');
  });

  test('delete removes the team', async ({ page }) => {
    const id = await createTeam(page, 'E2E delete me');
    test.skip(id === null, 'seed empty — run pnpm db:seed');

    await page.getByTestId('team-delete').click();
    await expect(page.getByTestId('verify-modal-delete')).toBeVisible();
    await page.getByTestId('verify-password-input').fill(PASSWORD);
    await page.getByTestId('verify-modal-confirm').click();

    await page.waitForURL(/\/en$/, { timeout: 15000 });

    const res = await page.request.get(`/api/teams/${id}`);
    expect(res.status()).toBe(404);
  });
});
