-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "MoveCategory" AS ENUM ('physical', 'special', 'status');

-- CreateEnum
CREATE TYPE "StatKey" AS ENUM ('hp', 'atk', 'def', 'spa', 'spd', 'spe');

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "description" TEXT,
    "level" SMALLINT NOT NULL DEFAULT 50,
    "password_hash" VARCHAR(60) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_pokemons" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "slot_order" SMALLINT NOT NULL,
    "pokemon_id" INTEGER NOT NULL,
    "ability_id" INTEGER NOT NULL,
    "item_id" INTEGER,
    "nature_id" SMALLINT NOT NULL,
    "ev_h" SMALLINT NOT NULL DEFAULT 0,
    "ev_a" SMALLINT NOT NULL DEFAULT 0,
    "ev_b" SMALLINT NOT NULL DEFAULT 0,
    "ev_c" SMALLINT NOT NULL DEFAULT 0,
    "ev_d" SMALLINT NOT NULL DEFAULT 0,
    "ev_s" SMALLINT NOT NULL DEFAULT 0,
    "iv_h" SMALLINT NOT NULL DEFAULT 31,
    "iv_a" SMALLINT NOT NULL DEFAULT 31,
    "iv_b" SMALLINT NOT NULL DEFAULT 31,
    "iv_c" SMALLINT NOT NULL DEFAULT 31,
    "iv_d" SMALLINT NOT NULL DEFAULT 31,
    "iv_s" SMALLINT NOT NULL DEFAULT 31,
    "tera_type" VARCHAR(16),

    CONSTRAINT "team_pokemons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_pokemon_moves" (
    "id" UUID NOT NULL,
    "team_pokemon_id" UUID NOT NULL,
    "move_id" INTEGER NOT NULL,
    "slot_order" SMALLINT NOT NULL,

    CONSTRAINT "team_pokemon_moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "nickname" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(60) NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "client_fp" VARCHAR(64) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemons" (
    "id" INTEGER NOT NULL,
    "name_en" VARCHAR(32) NOT NULL,
    "name_ko" VARCHAR(32) NOT NULL,
    "types" VARCHAR(16)[],
    "base_h" SMALLINT NOT NULL,
    "base_a" SMALLINT NOT NULL,
    "base_b" SMALLINT NOT NULL,
    "base_c" SMALLINT NOT NULL,
    "base_d" SMALLINT NOT NULL,
    "base_s" SMALLINT NOT NULL,
    "sprite_url" VARCHAR(200) NOT NULL,
    "form_of" INTEGER,

    CONSTRAINT "pokemons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moves" (
    "id" INTEGER NOT NULL,
    "name_en" VARCHAR(32) NOT NULL,
    "name_ko" VARCHAR(32) NOT NULL,
    "type" VARCHAR(16) NOT NULL,
    "category" "MoveCategory" NOT NULL,
    "power" SMALLINT,
    "accuracy" SMALLINT,
    "pp" SMALLINT NOT NULL,

    CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abilities" (
    "id" INTEGER NOT NULL,
    "name_en" VARCHAR(32) NOT NULL,
    "name_ko" VARCHAR(32) NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ko" TEXT NOT NULL,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" INTEGER NOT NULL,
    "name_en" VARCHAR(32) NOT NULL,
    "name_ko" VARCHAR(32) NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ko" TEXT NOT NULL,
    "effect_mult" JSONB,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "natures" (
    "id" SMALLINT NOT NULL,
    "name_en" VARCHAR(16) NOT NULL,
    "name_ko" VARCHAR(16) NOT NULL,
    "boost_stat" "StatKey",
    "reduce_stat" "StatKey",

    CONSTRAINT "natures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokemon_learnable_moves" (
    "pokemon_id" INTEGER NOT NULL,
    "move_id" INTEGER NOT NULL,

    CONSTRAINT "pokemon_learnable_moves_pkey" PRIMARY KEY ("pokemon_id","move_id")
);

-- CreateIndex
CREATE INDEX "teams_created_at_idx" ON "teams"("created_at" DESC);

-- CreateIndex
CREATE INDEX "teams_likes_count_created_at_idx" ON "teams"("likes_count" DESC, "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "team_pokemons_team_id_slot_order_key" ON "team_pokemons"("team_id", "slot_order");

-- CreateIndex
CREATE UNIQUE INDEX "team_pokemon_moves_team_pokemon_id_slot_order_key" ON "team_pokemon_moves"("team_pokemon_id", "slot_order");

-- CreateIndex
CREATE UNIQUE INDEX "team_pokemon_moves_team_pokemon_id_move_id_key" ON "team_pokemon_moves"("team_pokemon_id", "move_id");

-- CreateIndex
CREATE INDEX "comments_team_id_created_at_idx" ON "comments"("team_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "likes_team_id_client_fp_key" ON "likes"("team_id", "client_fp");

-- CreateIndex
CREATE INDEX "pokemon_learnable_moves_pokemon_id_idx" ON "pokemon_learnable_moves"("pokemon_id");

-- AddForeignKey
ALTER TABLE "team_pokemons" ADD CONSTRAINT "team_pokemons_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemons" ADD CONSTRAINT "team_pokemons_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemons" ADD CONSTRAINT "team_pokemons_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemons" ADD CONSTRAINT "team_pokemons_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemons" ADD CONSTRAINT "team_pokemons_nature_id_fkey" FOREIGN KEY ("nature_id") REFERENCES "natures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemon_moves" ADD CONSTRAINT "team_pokemon_moves_team_pokemon_id_fkey" FOREIGN KEY ("team_pokemon_id") REFERENCES "team_pokemons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_pokemon_moves" ADD CONSTRAINT "team_pokemon_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemons" ADD CONSTRAINT "pokemons_form_of_fkey" FOREIGN KEY ("form_of") REFERENCES "pokemons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_learnable_moves" ADD CONSTRAINT "pokemon_learnable_moves_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_learnable_moves" ADD CONSTRAINT "pokemon_learnable_moves_move_id_fkey" FOREIGN KEY ("move_id") REFERENCES "moves"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
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
