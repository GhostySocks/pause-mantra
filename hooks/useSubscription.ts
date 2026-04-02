import { useAuthStore } from '@/lib/store';
import { PRO_ENTITLEMENT, BASE_ENTITLEMENT } from '@/lib/revenuecat';

/**
 * Hook to check subscription entitlements
 * Currently uses local Zustand store (stubbed)
 * Will integrate with RevenueCat when keys are provided
 */
export function useSubscription() {
  const { isPro, isBase, subscriptionStatus, subscriptionTier } = useAuthStore();

  return {
    isPro,
    isBase,
    isActive: subscriptionStatus !== 'paused',
    isTrial: subscriptionStatus === 'trial',
    tier: subscriptionTier,
    status: subscriptionStatus,
  };
}
