import { useState, useCallback, useEffect } from 'react';
import { useSettingsStore } from '@/lib/store';

export type GatePhase = 'delay' | 'chant' | 'choice' | 'complete';

interface GateState {
  phase: GatePhase;
  chantStep: number;
  buttonReady: boolean;
  outcome: 'entered' | 'closed' | null;
}

export function useGate() {
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

  const chooseEnter = useCallback(() => {
    setState((s) => ({ ...s, phase: 'complete', outcome: 'entered' }));
  }, []);

  const chooseClose = useCallback(() => {
    setState((s) => ({ ...s, phase: 'complete', outcome: 'closed' }));
  }, []);

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
