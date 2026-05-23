import database from './database.js';

async function up() {
  const db = await database.connect();

  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS hosts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        category TEXT,
        status TEXT,
        uptime TEXT
      )
    `);
  } finally {
    await db.close();
  }
}

export default { up };
