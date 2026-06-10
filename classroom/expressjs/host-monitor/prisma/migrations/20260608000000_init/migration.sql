CREATE TABLE "hosts" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "category" TEXT,
  "status" TEXT NOT NULL DEFAULT 'Unknown',
  "uptime" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "last_checked_at" TEXT,

  CONSTRAINT "hosts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ping_checks" (
  "id" SERIAL NOT NULL,
  "host_id" TEXT NOT NULL,
  "checked_at" TEXT NOT NULL,
  "reachable" BOOLEAN NOT NULL,
  "transmitted" INTEGER DEFAULT 0,
  "received" INTEGER DEFAULT 0,
  "min_ms" DOUBLE PRECISION,
  "avg_ms" DOUBLE PRECISION,
  "max_ms" DOUBLE PRECISION,
  "stddev_ms" DOUBLE PRECISION,
  "output" TEXT,
  "error" TEXT,

  CONSTRAINT "ping_checks_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ping_checks_host_id_fkey"
    FOREIGN KEY ("host_id")
    REFERENCES "hosts" ("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE INDEX "idx_ping_checks_host_checked_at" ON "ping_checks"("host_id", "checked_at" DESC);
