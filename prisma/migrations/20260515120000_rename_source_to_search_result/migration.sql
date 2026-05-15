-- RenameTable
ALTER TABLE "Source" RENAME TO "SearchResult";

-- AlterTable
ALTER TABLE "SearchResult" ADD COLUMN "score" DOUBLE PRECISION;
