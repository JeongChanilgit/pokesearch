-- AlterTable
ALTER TABLE "pokemons" ADD COLUMN "showdown_id" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "pokemons_showdown_id_key" ON "pokemons"("showdown_id");
