import type { MantraCategory } from '@/constants/categories';

export interface Mantra {
  id: string;
  text: string;
  category: MantraCategory;
  source?: 'curated' | 'ai' | 'custom';
}

export interface GateEvent {
  id: string;
  userId: string;
  appName: string;
  mantraId: string | null;
  mantraText?: string;
  outcome: 'entered' | 'closed';
  createdAt: string;
  note?: string;
}

export interface GatedApp {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bundleId: string;
  packageName: string;
}

export interface MasterMantra {
  id: string;
  userId: string;
  mantraText: string;
  likedCount: number;
  createdAt: string;
}

export interface UserSettings {
  gateDelaySeconds: number;
  reflectionPromptsEnabled: boolean;
  masterMantraActive: boolean;
  gateMantraId: string | null;
  subscriptionStatus: 'trial' | 'active' | 'paused';
}

export type SubscriptionTier = 'base' | 'pro';
export type SubscriptionStatus = 'trial' | 'active' | 'paused';

export interface OnboardingState {
  selectedGoals: MantraCategory[];
  selectedApps: GatedApp[];
  selectedTier: SubscriptionTier;
  selectedPlan: string; // product ID
}
