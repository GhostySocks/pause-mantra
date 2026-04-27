import { create } from 'zustand';
import type { MantraCategory } from '@/constants/categories';
import type { GatedApp, SubscriptionStatus, SubscriptionTier } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier;
  isPro: boolean;
  isBase: boolean;
  setAuth: (userId: string, userName: string | null) => void;
  clearAuth: () => void;
  setSubscription: (status: SubscriptionStatus, tier: SubscriptionTier) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  userName: null,
  subscriptionStatus: 'trial',
  subscriptionTier: 'pro',
  isPro: true,  // Trial = Pro access
  isBase: true,
  setAuth: (userId, userName) =>
    set({ isAuthenticated: true, userId, userName }),
  clearAuth: () =>
    set({
      isAuthenticated: false,
      userId: null,
      userName: null,
      subscriptionStatus: 'paused',
      isPro: false,
      isBase: false,
    }),
  setSubscription: (status, tier) =>
    set({
      subscriptionStatus: status,
      subscriptionTier: tier,
      isPro: tier === 'pro' && status !== 'paused',
      isBase: status !== 'paused',
    }),
}));

interface OnboardingState {
  currentStep: number;
  userName: string;
  selectedGoals: MantraCategory[];
  selectedApps: GatedApp[];
  selectedTier: SubscriptionTier;
  selectedPlan: string;
  setStep: (step: number) => void;
  setUserName: (name: string) => void;
  setGoals: (goals: MantraCategory[]) => void;
  toggleGoal: (goal: MantraCategory) => void;
  setApps: (apps: GatedApp[]) => void;
  toggleApp: (app: GatedApp) => void;
  setTier: (tier: SubscriptionTier) => void;
  setPlan: (plan: string) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  userName: '',
  selectedGoals: [],
  selectedApps: [],
  selectedTier: 'pro',
  selectedPlan: 'pausemantra_pro_annual',
  setStep: (step) => set({ currentStep: step }),
  setUserName: (name) => set({ userName: name }),
  setGoals: (goals) => set({ selectedGoals: goals }),
  toggleGoal: (goal) =>
    set((state) => ({
      selectedGoals: state.selectedGoals.includes(goal)
        ? state.selectedGoals.filter((g) => g !== goal)
        : [...state.selectedGoals, goal],
    })),
  setApps: (apps) => set({ selectedApps: apps }),
  toggleApp: (app) =>
    set((state) => {
      const exists = state.selectedApps.find((a) => a.name === app.name);
      return {
        selectedApps: exists
          ? state.selectedApps.filter((a) => a.name !== app.name)
          : [...state.selectedApps, app],
      };
    }),
  setTier: (tier) =>
    set({
      selectedTier: tier,
      selectedPlan: tier === 'pro' ? 'pausemantra_pro_annual' : 'pausemantra_base_annual',
    }),
  setPlan: (plan) => set({ selectedPlan: plan }),
  reset: () =>
    set({
      currentStep: 1,
      userName: '',
      selectedGoals: [],
      selectedApps: [],
      selectedTier: 'pro',
      selectedPlan: 'pausemantra_pro_annual',
    }),
}));

interface SettingsState {
  gateDelaySeconds: number;
  reflectionPromptsEnabled: boolean;
  masterMantraActive: boolean;
  gateMantraId: string | null;
  setGateDelay: (seconds: number) => void;
  setReflectionPrompts: (enabled: boolean) => void;
  setMasterMantraActive: (active: boolean, mantraId?: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  gateDelaySeconds: 3,
  reflectionPromptsEnabled: false,
  masterMantraActive: false,
  gateMantraId: null,
  setGateDelay: (seconds) => set({ gateDelaySeconds: seconds }),
  setReflectionPrompts: (enabled) => set({ reflectionPromptsEnabled: enabled }),
  setMasterMantraActive: (active, mantraId) =>
    set({ masterMantraActive: active, gateMantraId: mantraId ?? null }),
}));
