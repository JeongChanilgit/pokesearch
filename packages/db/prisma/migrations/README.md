# Migrations

The initial migration is created the first time you run:

```bash
pnpm --filter @pokesearch/db db:migrate
```

That command uses Prisma to generate a timestamped folder under this directory
containing the auto-generated `migration.sql`. **After Prisma writes the file,
append the contents of [`../../sql/01-constraints-and-trgm.sql`](../../sql/01-constraints-and-trgm.sql)
to the bottom of that migration.sql** (CHECK constraints and GIN trigram indexes
aren't expressible in the Prisma schema).

If you prefer not to touch the generated file, you can instead run:

```bash
psql "$DATABASE_URL" -f ../sql/01-constraints-and-trgm.sql
```

after each fresh `db:migrate`. The statements are idempotent.
