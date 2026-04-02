import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, PillButton, ProgressBar } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { PRODUCTS, PRICING } from '@/lib/revenuecat';
import { useOnboardingStore, useAuthStore } from '@/lib/store';
import type { SubscriptionTier } from '@/types';

const BASE_FEATURES = [
  'Gate mechanic on unlimited apps',
  'Full 10,000+ mantra library',
  'Heart button + Liked Mantras gallery',
  'Gate log & reflection notes',
  'Streak \u2014 this month & last month',
];

const PRO_EXTRA_FEATURES = [
  'Master Mantra AI synthesis',
  'Full streak history \u2014 all time',
  'Reflection prompts on gate screen',
];

interface PlanOption {
  productId: string;
  label: string;
  price: string;
  subLabel?: string;
  popular?: boolean;
}

const BASE_PLANS: PlanOption[] = [
  { productId: PRODUCTS.BASE_ANNUAL, label: 'Annual', price: '$39/yr', subLabel: 'just $3.25/mo', popular: true },
  { productId: PRODUCTS.BASE_MONTHLY, label: 'Monthly', price: '$4.99/mo' },
];

const PRO_PLANS: PlanOption[] = [
  { productId: PRODUCTS.PRO_ANNUAL, label: 'Annual', price: '$59/yr', subLabel: 'just $4.92/mo', popular: true },
  { productId: PRODUCTS.PRO_MONTHLY, label: 'Monthly', price: '$7.99/mo' },
  { productId: PRODUCTS.PRO_LIFETIME, label: 'Lifetime', price: '$89 one-time' },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedTier, setTier, selectedPlan, setPlan } = useOnboardingStore();
  const { setAuth, setSubscription } = useAuthStore();

  const plans = selectedTier === 'pro' ? PRO_PLANS : BASE_PLANS;
  const features = selectedTier === 'pro'
    ? [...BASE_FEATURES, ...PRO_EXTRA_FEATURES]
    : BASE_FEATURES;

  const selectedPricing = PRICING[selectedPlan as keyof typeof PRICING];

  const handleSubscribe = () => {
    // TODO: RevenueCat purchase flow
    // For alpha, simulate successful subscription
    setAuth('demo-user-id', 'Sarah');
    setSubscription('trial', selectedTier);
    router.replace('/(tabs)');
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={5} />

        {/* Header */}
        <Text style={styles.eyebrow}>YOUR PRACTICE AWAITS</Text>
        <Text style={styles.headline}>
          Transform doom-scrolling into a life-giving ritual.
        </Text>
        <Text style={styles.subtitle}>
          Start your 7-day free trial. Cancel anytime.
        </Text>

        {/* Tier strip */}
        <View style={styles.tierStrip}>
          <Pressable
            onPress={() => setTier('base')}
            style={[styles.tierTab, selectedTier === 'base' && styles.tierTabActive]}
          >
            <Text style={[styles.tierTabText, selectedTier === 'base' && styles.tierTabTextActive]}>
              Base
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTier('pro')}
            style={[styles.tierTab, selectedTier === 'pro' && styles.tierTabActive]}
          >
            <Text style={[styles.tierTabText, selectedTier === 'pro' && styles.tierTabTextActive]}>
              Pro {'\u2726'}
            </Text>
          </Pressable>
        </View>

        {/* Plan cards */}
        <View style={styles.planCards}>
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.productId;
            return (
              <Pressable
                key={plan.productId}
                onPress={() => setPlan(plan.productId)}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.planCardRow}>
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                      {plan.price}
                      {plan.subLabel ? ` \u00b7 ${plan.subLabel}` : ''}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Feature list */}
        <View style={styles.featureList}>
          {selectedTier === 'pro' && BASE_FEATURES.length > 0 && (
            <Text style={styles.featureGroupLabel}>Everything in Base, plus:</Text>
          )}
          {(selectedTier === 'pro' ? PRO_EXTRA_FEATURES : features).map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                {selectedTier === 'pro' ? (
                  <Path d="M12 2l2.09 6.26L20 9.27l-4.91 3.82L16.18 20 12 16.27 7.82 20l1.09-6.91L4 9.27l5.91-1.01L12 2z" fill={Colors.teal} />
                ) : (
                  <Path d="M5 13l4 4L19 7" stroke={Colors.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                )}
              </Svg>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {selectedTier === 'base' && (
            BASE_FEATURES.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 13l4 4L19 7" stroke={Colors.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 36 }]}>
        <PillButton
          label="Start 7-day free trial"
          onPress={handleSubscribe}
          textStyle={{ fontWeight: '600' }}
        />
        <Text style={styles.subLabel}>
          Then {selectedPricing?.display ?? ''} {'\u00b7'} Cancel anytime {'\u00b7'} Restore purchases
        </Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120,
  },
  eyebrow: {
    fontFamily: Fonts.cormorant.regular,
    fontSize: FontSizes.caption,
    letterSpacing: LetterSpacing.eyebrow,
    color: Colors.teal,
    textAlign: 'center',
    marginBottom: 12,
  },
  headline: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.displaySmall,
    color: Colors.cream,
    lineHeight: FontSizes.displaySmall * LineHeights.tight,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
    lineHeight: FontSizes.bodySmall * LineHeights.relaxed,
    textAlign: 'center',
    marginBottom: 20,
  },
  tierStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.chipBg,
    borderRadius: Radius.pill,
    padding: 3,
    marginBottom: 20,
  },
  tierTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  tierTabActive: {
    backgroundColor: Colors.teal,
  },
  tierTabText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
  },
  tierTabTextActive: {
    fontFamily: Fonts.inter.medium,
    color: Colors.tealDark,
  },
  planCards: {
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: Colors.planUnselectedBg,
    borderWidth: 1.5,
    borderColor: Colors.planUnselectedBorder,
    borderRadius: Radius.tile,
    padding: 16,
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: Colors.planSelectedBg,
    borderColor: Colors.planSelectedBorder,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: Colors.teal,
    borderRadius: Radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  popularBadgeText: {
    fontFamily: Fonts.inter.semiBold,
    fontSize: FontSizes.micro,
    color: Colors.tealDark,
    textTransform: 'uppercase',
  },
  planCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(216,180,254,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.tealDark,
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  planPrice: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
  },
  planPriceSelected: {
    color: Colors.teal,
  },
  featureList: {
    gap: 10,
  },
  featureGroupLabel: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
    flex: 1,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: 16,
    backgroundColor: 'rgba(50,22,80,0.95)',
  },
  subLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.4)',
    textAlign: 'center',
    marginTop: 10,
  },
});
