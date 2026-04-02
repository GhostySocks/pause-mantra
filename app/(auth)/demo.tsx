import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { GradientBackground, PulseRings, PillButton } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '@/constants';

const DEMO_MANTRA = 'Possibility always collapses in my favor.';

const CHANT_STEPS = [
  { label: 'I said this once', color: Colors.chant.step0 },
  { label: 'I said this again', color: Colors.chant.step1 },
  { label: 'I said this three times', color: Colors.chant.step2 },
];

interface Tooltip {
  text: string;
  button: string;
  position: 'center' | 'upper' | 'heart' | 'above-cta';
}

const TOOLTIPS: Tooltip[] = [
  {
    text: "This is your Pause Mantra gate. Every time you open a gated app, you'll see this screen first.",
    button: 'Got it',
    position: 'center',
  },
  {
    text: "This is today's mantra. Read it — really read it — before you continue.",
    button: "I've read it",
    position: 'upper',
  },
  {
    text: 'Tap the heart to save a mantra you love. They build up in your Library.',
    button: 'Tap the heart \u2665',
    position: 'heart',
  },
  {
    text: 'Now say the mantra out loud — three times. Tap the button each time.',
    button: 'I said this once \u2192',
    position: 'above-cta',
  },
  {
    text: 'Again. Say it like you mean it.',
    button: 'I said this again \u2192',
    position: 'above-cta',
  },
  {
    text: 'One more time. Feel it land.',
    button: 'I said this three times \u2192',
    position: 'above-cta',
  },
  {
    text: 'Now choose — keep scrolling intentionally, or put the phone down.',
    button: 'Continue setup \u2192',
    position: 'above-cta',
  },
];

export default function GateDemoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [demoStep, setDemoStep] = useState(0);
  const [chantStep, setChantStep] = useState(0);
  const [heartFilled, setHeartFilled] = useState(false);
  const [showChoice, setShowChoice] = useState(false);

  const tooltip = TOOLTIPS[demoStep];

  const handleTooltipAction = useCallback(() => {
    if (demoStep === 2) {
      // Step 3: requires heart tap, tooltip button is just a prompt
      return;
    }
    if (demoStep === 3) {
      setChantStep(1);
      setDemoStep(4);
    } else if (demoStep === 4) {
      setChantStep(2);
      setDemoStep(5);
    } else if (demoStep === 5) {
      setChantStep(3);
      setShowChoice(true);
      setDemoStep(6);
    } else if (demoStep === 6) {
      router.push('/(auth)/permissions');
    } else {
      setDemoStep(demoStep + 1);
    }
  }, [demoStep, router]);

  const handleHeartTap = useCallback(() => {
    setHeartFilled(true);
    if (demoStep === 2) {
      setDemoStep(3);
    }
  }, [demoStep]);

  const getTooltipPosition = (position: string) => {
    switch (position) {
      case 'center':
        return { top: '35%' as unknown as number };
      case 'upper':
        return { top: '25%' as unknown as number };
      case 'heart':
        return { top: 90, right: 20 };
      case 'above-cta':
        return { bottom: 220 };
      default:
        return { top: '35%' as unknown as number };
    }
  };

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Demo header bar */}
        <View style={styles.demoHeader}>
          <Text style={styles.stepLabel}>STEP 3 OF 5</Text>
          <Text style={styles.demoBadge}>Demo mode</Text>
        </View>

        {/* Gate screen content */}
        <View style={styles.gateContent}>
          {/* App label */}
          <View style={styles.appLabel}>
            <View style={[styles.appIconSmall, { backgroundColor: '#E1306C' }]}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
            <Text style={styles.appName}>Instagram</Text>
          </View>

          {/* Heart button */}
          <View style={styles.heartContainer}>
            <HeartButton
              filled={heartFilled}
              onPress={handleHeartTap}
              color={Colors.teal}
            />
          </View>

          {/* Pulse rings */}
          <PulseRings
            outerSize={260}
            innerSize={200}
            outerColor={Colors.pulseRingOuter}
            innerColor={Colors.pulseRingInner}
          />

          {/* Mantra area */}
          <View style={styles.mantraArea}>
            <Text style={styles.mantraLabel}>TODAY'S MANTRA</Text>
            <Text style={styles.mantraText}>{DEMO_MANTRA}</Text>

            {/* Progress dots */}
            <View style={styles.progressDots}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i < chantStep ? Colors.progressDotActive : Colors.progressDotInactive },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Chant / Choice buttons */}
          <View style={styles.buttonArea}>
            {!showChoice ? (
              <>
                <View style={[styles.chantButton, { backgroundColor: CHANT_STEPS[Math.min(chantStep, 2)].color }]}>
                  <Text style={styles.chantButtonText}>
                    {CHANT_STEPS[Math.min(chantStep, 2)].label}
                  </Text>
                </View>
                <View style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </View>
              </>
            ) : (
              <View style={styles.choiceSplit}>
                <View style={[styles.choicePill, styles.choiceGhost]}>
                  <Text style={styles.choiceGhostText}>Keep it locked</Text>
                </View>
                <View style={[styles.choicePill, styles.choiceSolid]}>
                  <Text style={styles.choiceSolidText}>Open for 1 hour</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Tooltip overlay */}
        {tooltip && (
          <Animated.View
            entering={FadeIn.duration(300)}
            style={[styles.tooltip, getTooltipPosition(tooltip.position)]}
            key={demoStep}
          >
            <Text style={styles.tooltipText}>{tooltip.text}</Text>
            <Pressable
              onPress={handleTooltipAction}
              style={styles.tooltipButton}
            >
              <Text style={styles.tooltipButtonText}>{tooltip.button}</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  stepLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    letterSpacing: 2,
    color: Colors.teal,
  },
  demoBadge: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.5)',
  },
  gateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLabel: {
    position: 'absolute',
    top: 20,
    left: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.lavender,
  },
  heartContainer: {
    position: 'absolute',
    top: 20,
    right: 16,
    zIndex: 5,
  },
  mantraArea: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  mantraLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: 2,
    color: Colors.teal,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  mantraText: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraGate,
    color: Colors.cream,
    textAlign: 'center',
    lineHeight: FontSizes.mantraGate * 1.55,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  buttonArea: {
    position: 'absolute',
    bottom: 80,
    left: 28,
    right: 28,
    gap: 12,
  },
  chantButton: {
    borderRadius: Radius.pill,
    paddingVertical: 17,
    alignItems: 'center',
  },
  chantButtonText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    color: Colors.tealDark,
  },
  closeButton: {
    borderRadius: Radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.closeBorder,
  },
  closeButtonText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    color: Colors.ghostText,
  },
  choiceSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  choicePill: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingVertical: 17,
    alignItems: 'center',
  },
  choiceGhost: {
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.25)',
  },
  choiceGhostText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonMedium,
    color: Colors.cream,
  },
  choiceSolid: {
    backgroundColor: Colors.teal,
  },
  choiceSolidText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonMedium,
    color: Colors.tealDark,
  },
  tooltip: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: Colors.tooltipBg,
    borderWidth: 1,
    borderColor: Colors.tooltipBorder,
    borderRadius: 16,
    padding: 16,
    zIndex: 30,
    maxWidth: 280,
    alignSelf: 'center',
  },
  tooltipText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.cream,
    lineHeight: FontSizes.label * 1.55,
    marginBottom: 12,
  },
  tooltipButton: {
    backgroundColor: Colors.teal,
    borderRadius: Radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tooltipButtonText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.tealDark,
  },
});
