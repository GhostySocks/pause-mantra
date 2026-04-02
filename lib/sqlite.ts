import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('pausemantra.db');
  await initTables(db);
  return db;
}

async function initTables(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS mantras_cache (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      source TEXT DEFAULT 'curated'
    );

    CREATE TABLE IF NOT EXISTS seen_mantras_local (
      mantra_id TEXT PRIMARY KEY,
      seen_at TEXT DEFAULT (datetime('now')),
      show_again INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS liked_mantras_local (
      mantra_id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now')),
      deleted_at TEXT
    );
  `);
}

export async function getRandomMantra(
  categories?: string[]
): Promise<{ id: string; text: string; category: string } | null> {
  const database = await getDatabase();

  let query = `
    SELECT m.id, m.text, m.category
    FROM mantras_cache m
    LEFT JOIN seen_mantras_local s ON m.id = s.mantra_id AND s.show_again = 0
    WHERE s.mantra_id IS NULL
  `;

  const params: string[] = [];
  if (categories && categories.length > 0) {
    const placeholders = categories.map(() => '?').join(',');
    query += ` AND m.category IN (${placeholders})`;
    params.push(...categories);
  }

  query += ' ORDER BY RANDOM() LIMIT 1';

  const result = await database.getFirstAsync<{
    id: string;
    text: string;
    category: string;
  }>(query, params);

  return result ?? null;
}

export async function getMantrasByCategory(
  category: string,
  limit = 20,
  offset = 0
): Promise<{ id: string; text: string; category: string }[]> {
  const database = await getDatabase();
  return database.getAllAsync<{ id: string; text: string; category: string }>(
    'SELECT id, text, category FROM mantras_cache WHERE category = ? LIMIT ? OFFSET ?',
    [category, limit, offset]
  );
}

export async function markMantraAsSeen(mantraId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT OR IGNORE INTO seen_mantras_local (mantra_id) VALUES (?)',
    [mantraId]
  );
}

export async function toggleLikedMantra(mantraId: string): Promise<boolean> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ mantra_id: string; deleted_at: string | null }>(
    'SELECT mantra_id, deleted_at FROM liked_mantras_local WHERE mantra_id = ?',
    [mantraId]
  );

  if (existing) {
    if (existing.deleted_at) {
      await database.runAsync(
        'UPDATE liked_mantras_local SET deleted_at = NULL WHERE mantra_id = ?',
        [mantraId]
      );
      return true; // now liked
    } else {
      await database.runAsync(
        "UPDATE liked_mantras_local SET deleted_at = datetime('now') WHERE mantra_id = ?",
        [mantraId]
      );
      return false; // now unliked
    }
  } else {
    await database.runAsync(
      'INSERT INTO liked_mantras_local (mantra_id) VALUES (?)',
      [mantraId]
    );
    return true; // now liked
  }
}

export async function isMantraLiked(mantraId: string): Promise<boolean> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ mantra_id: string }>(
    'SELECT mantra_id FROM liked_mantras_local WHERE mantra_id = ? AND deleted_at IS NULL',
    [mantraId]
  );
  return result !== null;
}

export async function getLikedMantrasCount(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM liked_mantras_local WHERE deleted_at IS NULL'
  );
  return result?.count ?? 0;
}

export async function getMantraCountByCategory(): Promise<{ category: string; count: number }[]> {
  const database = await getDatabase();
  return database.getAllAsync<{ category: string; count: number }>(
    'SELECT category, COUNT(*) as count FROM mantras_cache GROUP BY category ORDER BY category'
  );
}

export async function seedMantras(
  mantras: { id: string; text: string; category: string }[]
): Promise<void> {
  const database = await getDatabase();
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mantras_cache'
  );

  if (existing && existing.count > 0) return; // Already seeded

  for (const mantra of mantras) {
    await database.runAsync(
      'INSERT OR IGNORE INTO mantras_cache (id, text, category) VALUES (?, ?, ?)',
      [mantra.id, mantra.text, mantra.category]
    );
  }
}
