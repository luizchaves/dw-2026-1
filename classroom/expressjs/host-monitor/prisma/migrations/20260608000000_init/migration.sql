CREATE TABLE "hosts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "category" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Unknown',
  "uptime" REAL NOT NULL DEFAULT 0,
  "last_checked_at" TEXT
);

CREATE TABLE "ping_checks" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "host_id" TEXT NOT NULL,
  "checked_at" TEXT NOT NULL,
  "reachable" BOOLEAN NOT NULL,
  "transmitted" INTEGER DEFAULT 0,
  "received" INTEGER DEFAULT 0,
  "min_ms" REAL,
  "avg_ms" REAL,
  "max_ms" REAL,
  "stddev_ms" REAL,
  "output" TEXT,
  "error" TEXT,
  CONSTRAINT "ping_checks_host_id_fkey"
    FOREIGN KEY ("host_id")
    REFERENCES "hosts" ("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "idx_ping_checks_host_checked_at" ON "ping_checks"("host_id", "checked_at" DESC);
