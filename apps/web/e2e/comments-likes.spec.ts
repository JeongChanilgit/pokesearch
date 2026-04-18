import { test, expect } from '@playwright/test';

// Slice 9 smoke — requires a seeded team. Creates one via the create flow and
// then exercises comments and likes on the newly created team's detail page.

async function createTeam(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/en/teams/new');
  await page.getByTestId('team-name-input').fill('Playwright comments team');
  await page.getByTestId('add-pokemon').click();
  await expect(page.getByTestId('picker-modal')).toBeVisible();
  const list = page.getByTestId('picker-list');
  const firstBtn = list.getByRole('button').first();
  const hasAny = await firstBtn
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);
  test.skip(!hasAny, 'seed empty — run pnpm db:seed');
  await firstBtn.click();
  await page.getByTestId('picker-add').click();
  await expect(page.getByTestId('pokemon-editor')).toBeVisible();

  await page.getByTestId('open-save-modal').click();
  await page.getByTestId('password-input').fill('secret123');
  await page.getByTestId('password-confirm-input').fill('secret123');
  await page.getByTestId('save-modal-confirm').click();
  await expect(page).toHaveURL(/\/en\/teams\/[0-9a-f-]{36}$/, { timeout: 15000 });
  const match = page.url().match(/\/teams\/([0-9a-f-]{36})/);
  return match![1]!;
}

test.describe('comments and likes', () => {
  test('post → appears; delete with wrong password → error; like/unlike', async ({
    page,
  }) => {
    const teamId = await createTeam(page);
    expect(teamId).toBeTruthy();

    // Like
    const likeBtn = page.getByTestId('like-button');
    const countBefore = Number(
      (await page.getByTestId('like-count').innerText()) || '0',
    );
    await likeBtn.click();
    await expect(page.getByTestId('like-count')).toHaveText(String(countBefore + 1));

    // Post comment
    await page.getByTestId('comment-nickname').fill('Tester');
    await page.getByTestId('comment-password').fill('delpass');
    await page.getByTestId('comment-content').fill('Nice team!');
    await page.getByTestId('comment-submit').click();

    const firstItem = page.getByTestId('comment-item').first();
    await expect(firstItem).toContainText('Nice team!');

    // Delete with wrong password → inline error
    await firstItem.getByTestId('comment-delete').click();
    await firstItem.getByTestId('comment-delete-password').fill('wrong');
    await firstItem.getByTestId('comment-delete-submit').click();
    await expect(firstItem.getByTestId('comment-delete-error')).toBeVisible();

    // Delete with right password
    await firstItem.getByTestId('comment-delete-password').fill('delpass');
    await firstItem.getByTestId('comment-delete-submit').click();
    await expect(firstItem).toHaveCount(0);

    // Unlike
    await likeBtn.click();
    await expect(page.getByTestId('like-count')).toHaveText(String(countBefore));
  });
});
