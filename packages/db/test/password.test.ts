import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/password.js';

describe('hashPassword / verifyPassword', () => {
  it('round-trips a correct password', async () => {
    const hash = await hashPassword('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('secret');
    await expect(verifyPassword('wrong', hash)).resolves.toBe(false);
  });

  it('produces a different hash each call (random salt)', async () => {
    const a = await hashPassword('same-input');
    const b = await hashPassword('same-input');
    expect(a).not.toBe(b);
    await expect(verifyPassword('same-input', a)).resolves.toBe(true);
    await expect(verifyPassword('same-input', b)).resolves.toBe(true);
  });
});
