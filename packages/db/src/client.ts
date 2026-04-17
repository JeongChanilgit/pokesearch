import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __pokesearchPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__pokesearchPrisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__pokesearchPrisma = prisma;
}
