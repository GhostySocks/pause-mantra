import { useState, useEffect, useCallback } from 'react';
import {
  getRandomMantra,
  getMantrasByCategory,
  markMantraAsSeen,
  syncMantrasFromSupabase,
  getMantraCountByCategory,
} from '@/lib/sqlite';
import type { Mantra } from '@/types';

// Sync mantras from Supabase on first use
let synced = false;

async function ensureSynced(): Promise<void> {
  if (synced) return;
  try {
    await syncMantrasFromSupabase();
    synced = true;
  } catch (e) {
    console.warn('Failed to sync mantras:', e);
  }
}

// Keep the current mantra stable across re-mounts (tab switches)
let cachedMantra: Mantra | null = null;

export function useRandomMantra(categories?: string[]) {
  const [mantra, setMantra] = useState<Mantra | null>(cachedMantra);
  const [loading, setLoading] = useState(false);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    await ensureSynced();
    const result = await getRandomMantra(categories);
    if (result) {
      const m = result as Mantra;
      cachedMantra = m;
      setMantra(m);
      await markMantraAsSeen(result.id);
    }
    setLoading(false);
  }, [categories]);

  // Only fetch on very first use (no cached mantra yet)
  useEffect(() => {
    if (!cachedMantra) {
      fetchNext();
    }
  }, []);

  return { mantra, loading, fetchNext };
}

export function useCategoryMantras(category: string, limit = 20) {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async (newOffset = 0) => {
    setLoading(true);
    await ensureSynced();
    const results = await getMantrasByCategory(category, limit, newOffset);
    if (newOffset === 0) {
      setMantras(results as Mantra[]);
    } else {
      setMantras((prev) => [...prev, ...(results as Mantra[])]);
    }
    setHasMore(results.length === limit);
    setOffset(newOffset + limit);
    setLoading(false);
  }, [category, limit]);

  useEffect(() => {
    fetch(0);
  }, [fetch]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetch(offset);
    }
  }, [hasMore, loading, offset, fetch]);

  return { mantras, loading, loadMore, hasMore };
}

export function useCategoryCounts() {
  const [counts, setCounts] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      await ensureSynced();
      const result = await getMantraCountByCategory();
      setCounts(result);
    })();
  }, []);

  return counts;
}
