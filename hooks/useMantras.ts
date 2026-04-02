import { useState, useEffect, useCallback } from 'react';
import {
  getRandomMantra,
  getMantrasByCategory,
  markMantraAsSeen,
  seedMantras,
  getMantraCountByCategory,
} from '@/lib/sqlite';
import type { Mantra } from '@/types';

// Load and seed mantras on first use
let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  try {
    const mantrasJson = require('@/assets/mantras.json');
    await seedMantras(mantrasJson);
    seeded = true;
  } catch (e) {
    console.warn('Failed to seed mantras:', e);
  }
}

export function useRandomMantra(categories?: string[]) {
  const [mantra, setMantra] = useState<Mantra | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    await ensureSeeded();
    const result = await getRandomMantra(categories);
    if (result) {
      setMantra(result as Mantra);
      await markMantraAsSeen(result.id);
    }
    setLoading(false);
  }, [categories]);

  useEffect(() => {
    fetchNext();
  }, [fetchNext]);

  return { mantra, loading, fetchNext };
}

export function useCategoryMantras(category: string, limit = 20) {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetch = useCallback(async (newOffset = 0) => {
    setLoading(true);
    await ensureSeeded();
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
      await ensureSeeded();
      const result = await getMantraCountByCategory();
      setCounts(result);
    })();
  }, []);

  return counts;
}
