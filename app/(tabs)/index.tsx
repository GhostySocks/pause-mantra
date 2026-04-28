import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, GlassCard } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { useAuthStore, useOnboardingStore } from '@/lib/store';
import { useRandomMantra } from '@/hooks/useMantras';
import { useHeart, useLikedCount } from '@/hooks/useHearts';
import { useGateStats } from '@/hooks/useGate';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

const FALLBACK_MANTRA = {
  id: 'fallback',
  text: 'I am exactly where I need to be, growing in ways I cannot yet see.',
  category: 'Peace' as const,
};

// Home screen tour tooltips
interface TourStep {
  text: string;
  button: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
}

const TOUR_STEPS: TourStep[] = [
  {
    text: "Welcome home! This is your daily mantra, a new one every time you open the app.",
    button: 'Next',
    position: { top: 280, left: 24, right: 24 },
  },
  {
    text: "Tap the heart to save mantras you love. They'll build toward your Master Mantra.",
    button: 'Next',
    position: { top: 340, left: 24, right: 24 },
  },
  {
    text: "These tiles track your practice: streak, gates today, and total mantras liked.",
    button: 'Next',
    position: { top: 460, left: 24, right: 24 },
  },
  {
    text: "Once you've hearted 5 mantras, your Master Mantra unlocks. A personal affirmation synthesised just for you.",
    button: 'Next',
    position: { bottom: 180, left: 24, right: 24 },
  },
  {
    text: "Explore your Library, track your Journal, or adjust Settings from the tabs below.",
    button: "Let's go!",
    position: { bottom: 120, left: 24, right: 24 },
  },
];

function FadeInView({ children, step }: { children: React.ReactNode; step: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [step]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName } = useAuthStore();
  const { selectedGoals } = useOnboardingStore();
  const { mantra, loading, fetchNext } = useRandomMantra(selectedGoals);
  const currentMantra = mantra ?? FALLBACK_MANTRA;
  const isFallbackMantra = mantra === null;
  const { liked, toggle: toggleHeart } = useHeart(currentMantra.id);
  const { count: likedCount, refresh: refreshLikedCount } = useLikedCount();
  const { todayCount, streak } = useGateStats();
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showLockedTip, setShowLockedTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('home_tour_completed').then((val) => {
      if (val !== 'true') setShowTour(true);
    });
  }, []);

  const greeting = getGreeting();
  const displayName = userName ?? 'there';
  const currentTour = showTour ? TOUR_STEPS[tourStep] : null;

  const advanceTour = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
      AsyncStorage.setItem('home_tour_completed', 'true');
    }
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showTour}
      >
        {/* Greeting */}
        <Text style={styles.greetingLabel}>{greeting}</Text>
        <Text style={styles.greetingName}>{displayName} {'✦'}</Text>

        {/* Mantra card */}
        <GlassCard style={styles.mantraCard}>
          <View style={styles.mantraHeader}>
            <Text style={styles.mantraLabel}>TODAY'S MANTRA</Text>
            <Pressable
              onPress={fetchNext}
              disabled={loading}
              hitSlop={12}
              style={styles.refreshButton}
            >
              <Svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                style={loading ? { opacity: 0.4 } : undefined}
              >
                <Path
                  d="M23 4v6h-6M1 20v-6h6"
                  stroke={Colors.teal}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                  stroke={Colors.teal}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </View>
          {loading ? (
            <Text style={[styles.mantraText, { opacity: 0.4 }]}>Loading...</Text>
          ) : (
            <Text style={styles.mantraText}>{currentMantra.text}</Text>
          )}
          <View style={styles.mantraFooter}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{currentMantra.category}</Text>
            </View>
            <HeartButton
              filled={liked}
              disabled={isFallbackMantra || loading}
              onPress={async () => {
                await toggleHeart();
                refreshLikedCount();
              }}
              size={20}
            />
          </View>
        </GlassCard>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <Pressable
            onPress={() => !showTour && router.push('/(tabs)/journal')}
            style={styles.statTileOuter}
          >
            <GlassCard style={styles.statTile} borderRadius={16} padding={16}>
              <Text style={styles.statLabel}>STREAK</Text>
              <Text style={styles.statNumber}>{streak}</Text>
              <Text style={styles.statUnit}>days {'✦'}</Text>
            </GlassCard>
          </Pressable>

          <Pressable style={styles.statTileOuter}>
            <GlassCard style={styles.statTile} borderRadius={16} padding={16}>
              <Text style={styles.statLabel}>TODAY</Text>
              <Text style={styles.statNumber}>{todayCount}</Text>
              <Text style={styles.statUnit}>gates {'✦'}</Text>
            </GlassCard>
          </Pressable>

          <Pressable
            onPress={() => !showTour && router.push('/(tabs)/library')}
            style={styles.statTileOuter}
          >
            <GlassCard style={styles.statTile} borderRadius={16} padding={16}>
              <Text style={styles.statLabel}>LIKED</Text>
              <Text style={styles.statNumber}>{likedCount}</Text>
              <Text style={styles.statUnit}>mantras {'✦'}</Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Master Mantra nudge card */}
        <Pressable
          onPress={() => {
            if (showTour) return;
            if (likedCount >= 5) {
              router.push('/master-mantra');
            } else {
              setShowLockedTip(true);
              setTimeout(() => setShowLockedTip(false), 3000);
            }
          }}
        >
          <GlassCard style={styles.masterCard} borderRadius={16} padding={16}>
          <View style={styles.masterCardContent}>
            <Text style={styles.masterCardTitle}>
              {likedCount >= 5 ? 'Your Master Mantra is ready' : 'Unlock your Master Mantra'}
            </Text>
            <Text style={styles.masterCardSub}>
              {likedCount >= 5
                ? `Tap to synthesise from ${likedCount} likes`
                : `Heart ${5 - likedCount} more mantra${5 - likedCount === 1 ? '' : 's'} to unlock`}
            </Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={Colors.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          </GlassCard>
        </Pressable>

      </ScrollView>

      {/* Locked tooltip overlay */}
      {showLockedTip && (
        <>
          <Pressable style={styles.lockedBackdrop} onPress={() => setShowLockedTip(false)} />
          <View style={styles.lockedOverlay} pointerEvents="box-none">
            <FadeInView step={0}>
              <View style={styles.lockedTip}>
                <Text style={styles.lockedTipText}>
                  Heart {5 - likedCount} more mantra{5 - likedCount === 1 ? '' : 's'} to unlock your Master Mantra — a personal affirmation synthesised just for you.
                </Text>
                <Pressable onPress={() => setShowLockedTip(false)} style={styles.lockedTipButton}>
                  <Text style={styles.lockedTipButtonText}>Got it</Text>
                </Pressable>
              </View>
            </FadeInView>
          </View>
        </>
      )}

      {/* Tour overlay */}
      {currentTour && (
        <>
          {/* Dim backdrop */}
          <View style={styles.tourBackdrop} pointerEvents="box-none" />

          {/* Tooltip */}
          <View style={[styles.tourTooltipWrapper, currentTour.position]} key={tourStep}>
            <FadeInView step={tourStep}>
              <View style={styles.tourTooltip}>
                <Text style={styles.tourStepIndicator}>
                  {tourStep + 1} of {TOUR_STEPS.length}
                </Text>
                <Text style={styles.tourText}>{currentTour.text}</Text>
                <View style={styles.tourButtonRow}>
                  {tourStep > 0 && (
                    <Pressable onPress={() => setTourStep(tourStep - 1)} style={styles.tourBackButton}>
                      <Text style={styles.tourBackText}>Back</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={advanceTour} style={[styles.tourNextButton, tourStep === 0 && { flex: 1 }]}>
                    <Text style={styles.tourNextText}>{currentTour.button}</Text>
                  </Pressable>
                </View>
              </View>
            </FadeInView>
          </View>
        </>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: 100,
  },
  greetingLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
  },
  greetingName: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.displaySmall,
    color: Colors.cream,
    marginBottom: 24,
  },
  mantraCard: {
    marginBottom: Spacing.base,
  },
  mantraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mantraLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.sectionLabel,
    color: Colors.teal,
  },
  mantraText: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraGate,
    color: Colors.cream,
    lineHeight: FontSizes.mantraGate * 1.55,
    marginBottom: 16,
  },
  mantraFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    backgroundColor: 'rgba(216,180,254,0.1)',
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.tileGap,
    marginBottom: Spacing.base,
  },
  statTileOuter: {
    flex: 1,
  },
  statTile: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 4,
  },
  statNumber: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.statNumber,
    color: Colors.cream,
  },
  statUnit: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
  },
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  masterCardContent: {
    flex: 1,
  },
  masterCardTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  masterCardSub: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
  },

  // Locked tooltip
  lockedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 21,
  },
  lockedTip: {
    backgroundColor: Colors.tooltipBg,
    borderWidth: 1,
    borderColor: Colors.tooltipBorder,
    borderRadius: 16,
    padding: 20,
  },
  lockedTipText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.cream,
    lineHeight: FontSizes.label * 1.55,
    marginBottom: 12,
  },
  lockedTipButton: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lockedTipButtonText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.tealDark,
  },

  // Tour overlay styles
  tourBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  tourTooltipWrapper: {
    position: 'absolute',
    zIndex: 30,
  },
  tourTooltip: {
    backgroundColor: Colors.tooltipBg,
    borderWidth: 1,
    borderColor: Colors.tooltipBorder,
    borderRadius: 16,
    padding: 16,
  },
  tourStepIndicator: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: Colors.teal,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tourText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.cream,
    lineHeight: FontSizes.label * 1.55,
    marginBottom: 14,
  },
  tourButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tourBackButton: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.25)',
  },
  tourBackText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  tourNextButton: {
    flex: 2,
    backgroundColor: Colors.teal,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tourNextText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.tealDark,
  },
});
