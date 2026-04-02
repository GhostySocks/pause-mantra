import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, ScrollView, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { useAuthStore } from '@/lib/store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

const PLACEHOLDER_MANTRA = {
  id: '1',
  text: 'I am exactly where I need to be, growing in ways I cannot yet see.',
  category: 'Peace',
};

// Home screen tour tooltips
interface TourStep {
  text: string;
  button: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
}

const TOUR_STEPS: TourStep[] = [
  {
    text: "Welcome home! This is your daily mantra — a new one every time you open the app.",
    button: 'Next',
    position: { top: 280, left: 24, right: 24 },
  },
  {
    text: "Tap the heart to save mantras you love. They'll build toward your Master Mantra.",
    button: 'Next',
    position: { top: 340, left: 24, right: 24 },
  },
  {
    text: "These tiles track your practice — streak, gates today, and total mantras liked.",
    button: 'Next',
    position: { top: 460, left: 24, right: 24 },
  },
  {
    text: "Once you've hearted 5 mantras, your Master Mantra unlocks — a personal affirmation synthesised just for you.",
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
  const [heartFilled, setHeartFilled] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showTour, setShowTour] = useState(true);

  const greeting = getGreeting();
  const displayName = userName ?? 'there';
  const currentTour = showTour ? TOUR_STEPS[tourStep] : null;

  const advanceTour = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
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
        <View style={styles.mantraCard}>
          <Text style={styles.mantraLabel}>TODAY'S MANTRA</Text>
          <Text style={styles.mantraText}>{PLACEHOLDER_MANTRA.text}</Text>
          <View style={styles.mantraFooter}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{PLACEHOLDER_MANTRA.category}</Text>
            </View>
            <HeartButton
              filled={heartFilled}
              onPress={() => setHeartFilled(!heartFilled)}
              size={20}
            />
          </View>
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <Pressable
            style={styles.statTile}
            onPress={() => !showTour && router.push('/(tabs)/journal')}
          >
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statUnit}>days {'✦'}</Text>
          </Pressable>

          <Pressable style={styles.statTile}>
            <Text style={styles.statLabel}>TODAY</Text>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statUnit}>gates {'✦'}</Text>
          </Pressable>

          <Pressable
            style={styles.statTile}
            onPress={() => !showTour && router.push('/(tabs)/library')}
          >
            <Text style={styles.statLabel}>LIKED</Text>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statUnit}>mantras {'✦'}</Text>
          </Pressable>
        </View>

        {/* Master Mantra nudge card */}
        <Pressable
          style={styles.masterCard}
          onPress={() => !showTour && router.push('/master-mantra')}
        >
          <View style={styles.masterCardContent}>
            <Text style={styles.masterCardTitle}>Your Master Mantra is ready</Text>
            <Text style={styles.masterCardSub}>Tap to synthesise from 34 likes</Text>
          </View>
          <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={Colors.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </ScrollView>

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
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.card,
    padding: Spacing.xl,
    marginBottom: Spacing.base,
  },
  mantraLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.sectionLabel,
    color: Colors.teal,
    marginBottom: 12,
  },
  mantraText: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraCard,
    color: Colors.cream,
    lineHeight: FontSizes.mantraCard * LineHeights.normal,
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
  statTile: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.12)',
    borderRadius: Radius.tile,
    padding: Spacing.tilePadding,
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
    backgroundColor: Colors.masterCardBg,
    borderWidth: 1,
    borderColor: Colors.masterCardBorder,
    borderRadius: Radius.tile,
    padding: 16,
    paddingHorizontal: 18,
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
