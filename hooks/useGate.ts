import { useState, useCallback, useEffect } from 'react';
import { useSettingsStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export type GatePhase = 'delay' | 'chant' | 'choice' | 'complete';

interface GateState {
  phase: GatePhase;
  chantStep: number;
  buttonReady: boolean;
  outcome: 'entered' | 'closed' | null;
}

type UseGateOptions = {
  appName?: string;
  mantraId?: string;
};

export function useGate(options: UseGateOptions = {}) {
  const { gateDelaySeconds } = useSettingsStore();
  const [state, setState] = useState<GateState>({
    phase: 'delay',
    chantStep: 0,
    buttonReady: gateDelaySeconds === 0,
    outcome: null,
  });

  // Handle delay timer
  useEffect(() => {
    if (gateDelaySeconds === 0) {
      setState((s) => ({ ...s, phase: 'chant', buttonReady: true }));
      return;
    }

    const timer = setTimeout(() => {
      setState((s) => ({ ...s, phase: 'chant', buttonReady: true }));
    }, gateDelaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [gateDelaySeconds]);

  const advanceChant = useCallback(() => {
    setState((s) => {
      if (!s.buttonReady || s.phase === 'choice' || s.phase === 'complete') return s;

      if (s.chantStep < 2) {
        return { ...s, chantStep: s.chantStep + 1 };
      }

      // Third tap — show choice
      return { ...s, phase: 'choice', chantStep: 3 };
    });
  }, []);

  const logGateEvent = useCallback((outcome: 'entered' | 'closed') => {
    const { userId } = useAuthStore.getState();
    if (!userId || !options.appName) return;

    supabase
      .from('gate_events')
      .insert({
        user_id: userId,
        app_name: options.appName,
        mantra_id: options.mantraId ?? null,
        outcome,
      })
      .then(({ error }) => {
        if (error) console.warn('Failed to log gate event:', error.message);
      });
  }, [options.appName, options.mantraId]);

  const chooseEnter = useCallback(() => {
    setState((s) => ({ ...s, phase: 'complete', outcome: 'entered' }));
    logGateEvent('entered');
  }, [logGateEvent]);

  const chooseClose = useCallback(() => {
    setState((s) => ({ ...s, phase: 'complete', outcome: 'closed' }));
    logGateEvent('closed');
  }, [logGateEvent]);

  const reset = useCallback(() => {
    setState({
      phase: gateDelaySeconds === 0 ? 'chant' : 'delay',
      chantStep: 0,
      buttonReady: gateDelaySeconds === 0,
      outcome: null,
    });
  }, [gateDelaySeconds]);

  return {
    ...state,
    advanceChant,
    chooseEnter,
    chooseClose,
    reset,
  };
}

/**
 * Fetches gate stats from Supabase for the Home screen.
 * Returns today's gate count and current streak (consecutive days with gates).
 */
export function useGateStats() {
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    // Today's gates — only real gate events, not app_open
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count: todayGates } = await supabase
      .from('gate_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('outcome', 'entered')
      .neq('app_name', 'app_open')
      .gte('created_at', todayStart.toISOString());

    setTodayCount(todayGates ?? 0);

    // Streak: count consecutive days with any activity (including app_open)
    const { data: events } = await supabase
      .from('gate_events')
      .select('created_at')
      .eq('user_id', userId)
      .eq('outcome', 'entered')
      .order('created_at', { ascending: false })
      .limit(500);

    if (events && events.length > 0) {
      const daysWithGates = new Set<string>();
      for (const e of events) {
        const day = new Date(e.created_at).toISOString().split('T')[0];
        daysWithGates.add(day);
      }

      let currentStreak = 0;
      const date = new Date();
      // Check if today has activity; if not, start from yesterday
      const todayStr = date.toISOString().split('T')[0];
      if (!daysWithGates.has(todayStr)) {
        date.setDate(date.getDate() - 1);
      }

      while (true) {
        const dayStr = date.toISOString().split('T')[0];
        if (daysWithGates.has(dayStr)) {
          currentStreak++;
          date.setDate(date.getDate() - 1);
        } else {
          break;
        }
      }
      setStreak(currentStreak);
    } else {
      setStreak(0);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { todayCount, streak, loading, refresh };
}
