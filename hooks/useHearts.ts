import { useState, useEffect, useCallback } from 'react';
import { toggleLikedMantra, isMantraLiked, getLikedMantrasCount } from '@/lib/sqlite';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

export function useHeart(mantraId: string) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    (async () => {
      const currentUserId = useAuthStore.getState().userId;
      const result = await isMantraLiked(mantraId, currentUserId ?? undefined);
      setLiked(result);
    })();
  }, [mantraId]);

  const toggle = useCallback(async () => {
    // Determine new state (SQLite or Supabase fallback)
    const newState = await toggleLikedMantra(mantraId);
    setLiked(newState);

    // Sync to Supabase — await so callers can refresh after
    const { userId } = useAuthStore.getState();
    if (userId) {
      if (newState) {
        const { error } = await supabase
          .from('liked_mantras')
          .upsert(
            { user_id: userId, mantra_id: mantraId, deleted_at: null },
            { onConflict: 'user_id,mantra_id' }
          );
        if (error) console.warn('Failed to sync like:', error.message);
      } else {
        const { error } = await supabase
          .from('liked_mantras')
          .update({ deleted_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('mantra_id', mantraId);
        if (error) console.warn('Failed to sync unlike:', error.message);
      }
    }

    return newState;
  }, [mantraId]);

  return { liked, toggle };
}

export function useLikedCount() {
  const [count, setCount] = useState(0);
  const userId = useAuthStore((s) => s.userId);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const result = await getLikedMantrasCount(userId);
    setCount(result);
  }, [userId]);

  // Re-fetch whenever userId changes (null → real id on app start)
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
