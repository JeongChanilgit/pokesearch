-- CreateTable
CREATE TABLE "crawler_hashes" (
    "entity_type" VARCHAR(32) NOT NULL,
    "entity_id" VARCHAR(64) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawler_hashes_pkey" PRIMARY KEY ("entity_type", "entity_id")
);
