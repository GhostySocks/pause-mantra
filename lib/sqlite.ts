import * as SQLite from 'expo-sqlite';
import { supabase } from '@/lib/supabase';

let db: SQLite.SQLiteDatabase | null = null;
let dbFailed = false;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase | null> {
  if (dbFailed) return null;
  if (db) return db;
  try {
    const newDb = await SQLite.openDatabaseAsync('pausemantra.db');
    await initTables(newDb);
    // Health check — verify the database actually works
    await newDb.getFirstAsync('SELECT 1');
    db = newDb;
    return db;
  } catch (e) {
    console.warn('SQLite init failed, falling back to Supabase only:', e);
    dbFailed = true;
    db = null;
    return null;
  }
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

  if (database) {
    try {
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

      if (result) return result;
    } catch (e) {
      console.warn('SQLite getRandomMantra failed, using Supabase:', e);
    }
  }

  // Fallback: fetch random mantra from Supabase
  let sbQuery = supabase.from('mantras').select('id, text, category').eq('active', true);
  if (categories && categories.length > 0) {
    sbQuery = sbQuery.in('category', categories);
  }
  const { data } = await sbQuery.limit(20);
  if (data && data.length > 0) {
    return data[Math.floor(Math.random() * data.length)];
  }
  return null;
}

export async function getMantrasByCategory(
  category: string,
  limit = 20,
  offset = 0
): Promise<{ id: string; text: string; category: string }[]> {
  const database = await getDatabase();

  if (database) {
    try {
      return await database.getAllAsync<{ id: string; text: string; category: string }>(
        'SELECT id, text, category FROM mantras_cache WHERE category = ? LIMIT ? OFFSET ?',
        [category, limit, offset]
      );
    } catch (e) {
      console.warn('SQLite getMantrasByCategory failed, using Supabase:', e);
    }
  }

  const { data } = await supabase
    .from('mantras')
    .select('id, text, category')
    .eq('category', category)
    .eq('active', true)
    .range(offset, offset + limit - 1);
  return data ?? [];
}

export async function markMantraAsSeen(mantraId: string): Promise<void> {
  const database = await getDatabase();
  if (!database) return;
  try {
    await database.runAsync(
      'INSERT OR IGNORE INTO seen_mantras_local (mantra_id) VALUES (?)',
      [mantraId]
    );
  } catch (e) {
    console.warn('SQLite markMantraAsSeen failed:', e);
  }
}

export async function toggleLikedMantra(mantraId: string): Promise<boolean> {
  const database = await getDatabase();

  if (!database) {
    // Check current state from Supabase to determine toggle direction
    // userId comes from the caller via useHearts hook
    const storeModule = require('@/lib/store');
    const userId = storeModule.useAuthStore.getState().userId;
    if (!userId) return true;
    const { data } = await supabase
      .from('liked_mantras')
      .select('id, deleted_at')
      .eq('user_id', userId)
      .eq('mantra_id', mantraId)
      .limit(1);
    const existing = data?.[0];
    if (existing && !existing.deleted_at) {
      return false; // currently liked → will be unliked
    }
    return true; // not liked → will be liked
  }

  try {
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
        return true;
      } else {
        await database.runAsync(
          "UPDATE liked_mantras_local SET deleted_at = datetime('now') WHERE mantra_id = ?",
          [mantraId]
        );
        return false;
      }
    } else {
      await database.runAsync(
        'INSERT INTO liked_mantras_local (mantra_id) VALUES (?)',
        [mantraId]
      );
      return true;
    }
  } catch (e) {
    console.warn('SQLite toggleLikedMantra failed:', e);
    return true;
  }
}

export async function isMantraLiked(mantraId: string, userId?: string): Promise<boolean> {
  const database = await getDatabase();

  if (database) {
    try {
      const result = await database.getFirstAsync<{ mantra_id: string }>(
        'SELECT mantra_id FROM liked_mantras_local WHERE mantra_id = ? AND deleted_at IS NULL',
        [mantraId]
      );
      return result !== null;
    } catch (e) {
      console.warn('SQLite isMantraLiked failed, using Supabase:', e);
    }
  }

  if (!userId) return false;
  const { data } = await supabase
    .from('liked_mantras')
    .select('id')
    .eq('user_id', userId)
    .eq('mantra_id', mantraId)
    .is('deleted_at', null)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

export async function getLikedMantrasCount(userId?: string): Promise<number> {
  const database = await getDatabase();

  if (database) {
    try {
      const result = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM liked_mantras_local WHERE deleted_at IS NULL'
      );
      return result?.count ?? 0;
    } catch (e) {
      console.warn('SQLite getLikedMantrasCount failed, using Supabase:', e);
    }
  }

  if (!userId) return 0;
  const { count } = await supabase
    .from('liked_mantras')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);
  return count ?? 0;
}

export async function getMantraCountByCategory(): Promise<{ category: string; count: number }[]> {
  const database = await getDatabase();

  if (database) {
    try {
      return await database.getAllAsync<{ category: string; count: number }>(
        'SELECT category, COUNT(*) as count FROM mantras_cache GROUP BY category ORDER BY category'
      );
    } catch (e) {
      console.warn('SQLite getMantraCountByCategory failed, using Supabase:', e);
    }
  }

  const { data } = await supabase
    .from('mantras')
    .select('category')
    .eq('active', true);
  if (!data) return [];
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.category] = (counts[row.category] ?? 0) + 1;
  }
  return Object.entries(counts).map(([category, count]) => ({ category, count }));
}

export async function seedMantras(
  mantras: { id: string; text: string; category: string }[]
): Promise<void> {
  const database = await getDatabase();
  if (!database) return;

  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM mantras_cache'
  );

  if (existing && existing.count > 0) return;

  for (const mantra of mantras) {
    await database.runAsync(
      'INSERT OR IGNORE INTO mantras_cache (id, text, category) VALUES (?, ?, ?)',
      [mantra.id, mantra.text, mantra.category]
    );
  }
}

/**
 * Sync mantras from Supabase to local SQLite cache.
 * Pulls all active mantras and upserts into mantras_cache.
 */
export async function syncMantrasFromSupabase(): Promise<void> {
  const database = await getDatabase();

  // Always fetch from Supabase (needed for fallback mode too)
  const { data, error } = await supabase
    .from('mantras')
    .select('id, text, category')
    .eq('active', true);

  if (error) {
    console.warn('Failed to sync mantras from Supabase:', error.message);
    return;
  }

  if (!data || data.length === 0) return;
  if (!database) return; // Data fetched but no SQLite to cache in — that's fine

  for (const mantra of data) {
    await database.runAsync(
      'INSERT OR REPLACE INTO mantras_cache (id, text, category) VALUES (?, ?, ?)',
      [mantra.id, mantra.text, mantra.category]
    );
  }
}
