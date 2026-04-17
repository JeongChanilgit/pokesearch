-- CHECK constraints and trigram indexes that Prisma cannot express.
-- Safe to re-run.

ALTER TABLE team_pokemons
  DROP CONSTRAINT IF EXISTS ev_sum_max;

ALTER TABLE team_pokemons
  ADD CONSTRAINT ev_sum_max CHECK (
    ev_h + ev_a + ev_b + ev_c + ev_d + ev_s <= 510
  );

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_pokemons_name_en_trgm
  ON pokemons USING gin (name_en gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_pokemons_name_ko_trgm
  ON pokemons USING gin (name_ko gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_moves_name_en_trgm
  ON moves USING gin (name_en gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_moves_name_ko_trgm
  ON moves USING gin (name_ko gin_trgm_ops);
