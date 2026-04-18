-- DropIndex
DROP INDEX "idx_moves_name_en_trgm";

-- DropIndex
DROP INDEX "idx_moves_name_ko_trgm";

-- DropIndex
DROP INDEX "idx_pokemons_name_en_trgm";

-- DropIndex
DROP INDEX "idx_pokemons_name_ko_trgm";

-- AlterTable
ALTER TABLE "moves" ADD COLUMN     "short_desc_en" TEXT,
ADD COLUMN     "short_desc_ko" TEXT;

-- CreateTable
CREATE TABLE "pokemon_abilities" (
    "pokemon_id" INTEGER NOT NULL,
    "ability_id" INTEGER NOT NULL,

    CONSTRAINT "pokemon_abilities_pkey" PRIMARY KEY ("pokemon_id","ability_id")
);

-- CreateIndex
CREATE INDEX "pokemon_abilities_pokemon_id_idx" ON "pokemon_abilities"("pokemon_id");

-- AddForeignKey
ALTER TABLE "pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_pokemon_id_fkey" FOREIGN KEY ("pokemon_id") REFERENCES "pokemons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pokemon_abilities" ADD CONSTRAINT "pokemon_abilities_ability_id_fkey" FOREIGN KEY ("ability_id") REFERENCES "abilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
