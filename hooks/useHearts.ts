import { useState, useEffect, useCallback } from 'react';
import { toggleLikedMantra, isMantraLiked, getLikedMantrasCount } from '@/lib/sqlite';

export function useHeart(mantraId: string) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await isMantraLiked(mantraId);
      setLiked(result);
    })();
  }, [mantraId]);

  const toggle = useCallback(async () => {
    const newState = await toggleLikedMantra(mantraId);
    setLiked(newState);
    return newState;
  }, [mantraId]);

  return { liked, toggle };
}

export function useLikedCount() {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const result = await getLikedMantrasCount();
    setCount(result);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { count, refresh };
}
