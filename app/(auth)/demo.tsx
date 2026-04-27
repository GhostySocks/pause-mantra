import { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, PulseRings, PillButton } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '@/constants';

const DEMO_MANTRA = 'Possibility always collapses in my favor.';

const CHANT_STEPS = [
  { label: 'I said this once', color: Colors.chant.step0 },
  { label: 'I said this again', color: Colors.chant.step1 },
  { label: 'I said this three times', color: Colors.chant.step2 },
];

interface TooltipDef {
  text: string;
  button: string;
  position: 'center' | 'upper' | 'heart' | 'above-cta';
}

const TOOLTIPS: TooltipDef[] = [
  { text: "This is your Pause Mantra gate. Every time you open a gated app, you'll see this screen first.", button: 'Got it', position: 'center' },
  { text: "This is today's mantra. Read it, really read it, before you continue.", button: "I've read it", position: 'upper' },
  { text: 'Tap the heart to save a mantra you love. They build up in your Library.', button: 'Tap the heart ♥', position: 'heart' },
  { text: 'Now say the mantra out loud, three times. Tap the button each time.', button: 'I said this once →', position: 'above-cta' },
  { text: 'Again. Say it like you mean it.', button: 'I said this again →', position: 'above-cta' },
  { text: 'One more time. Feel it land.', button: 'I said this three times →', position: 'above-cta' },
  { text: 'Now choose. Keep scrolling intentionally, or put the phone down.', button: 'Continue setup →', position: 'above-cta' },
];

function FadeInView({ children, step }: { children: React.ReactNode; step: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, [step]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

export default function GateDemoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [demoStep, setDemoStep] = useState(0);
  const [chantStep, setChantStep] = useState(0);
  const [heartFilled, setHeartFilled] = useState(false);
  const [showChoice, setShowChoice] = useState(false);

  const tooltip = TOOLTIPS[demoStep];

  const handleTooltipAction = useCallback(() => {
    if (demoStep === 2) { setHeartFilled(true); setDemoStep(3); return; }
    if (demoStep === 3) { setChantStep(1); setDemoStep(4); }
    else if (demoStep === 4) { setChantStep(2); setDemoStep(5); }
    else if (demoStep === 5) { setChantStep(3); setShowChoice(true); setDemoStep(6); }
    else if (demoStep === 6) { router.push('/(auth)/permissions'); }
    else { setDemoStep(demoStep + 1); }
  }, [demoStep, router]);

  const handleHeartTap = useCallback(() => {
    setHeartFilled(true);
    if (demoStep === 2) setDemoStep(3);
  }, [demoStep]);

  const getTooltipStyle = (position: string) => {
    switch (position) {
      case 'center': return { top: '35%' as unknown as number };
      case 'upper': return { top: '25%' as unknown as number };
      case 'heart': return { top: 90, right: 20 };
      case 'above-cta': return { bottom: 220 };
      default: return { top: '35%' as unknown as number };
    }
  };

  return (
    <GradientBackground showStars={false}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.demoHeader}>
          <Text style={styles.stepLabel}>STEP 3 OF 5</Text>
          <Text style={styles.demoBadge}>Demo mode</Text>
        </View>

        <View style={styles.gateContent}>
          <View style={styles.appLabel}>
            <View style={[styles.appIconSmall, { backgroundColor: '#E1306C' }]}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
            <View>
              <Text style={styles.appBlockingLabel}>GATING</Text>
              <Text style={styles.appName}>Instagram</Text>
            </View>
          </View>

          <View style={styles.heartContainer}>
            <HeartButton filled={heartFilled} onPress={handleHeartTap} color={Colors.teal} />
          </View>

          <View style={styles.mantraArea}>
            <PulseRings outerSize={280} innerSize={220} outerColor="rgba(126,200,192,0.25)" innerColor="rgba(126,200,192,0.15)" />
            <Text style={styles.mantraLabel}>TODAY'S MANTRA</Text>
            <Text style={styles.mantraText}>{DEMO_MANTRA}</Text>
            <View style={styles.progressDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i < chantStep ? Colors.progressDotActive : Colors.progressDotInactive }]} />
              ))}
            </View>
          </View>

          <View style={styles.buttonArea}>
            {!showChoice ? (
              <>
                <View style={[styles.chantButton, { backgroundColor: CHANT_STEPS[Math.min(chantStep, 2)].color }]}>
                  <Text style={styles.chantButtonText}>{CHANT_STEPS[Math.min(chantStep, 2)].label}</Text>
                </View>
                <Pressable onPress={() => router.back()} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
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

        {tooltip && (
          <View style={[styles.tooltipWrapper, getTooltipStyle(tooltip.position)]} key={demoStep}>
            <FadeInView step={demoStep}>
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>{tooltip.text}</Text>
                <Pressable onPress={handleTooltipAction} style={styles.tooltipButton}>
                  <Text style={styles.tooltipButtonText}>{tooltip.button}</Text>
                </Pressable>
              </View>
            </FadeInView>
          </View>
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  demoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.xl, paddingTop: 12, paddingBottom: 8, zIndex: 10 },
  stepLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, letterSpacing: 2, color: Colors.teal },
  demoBadge: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, color: 'rgba(196,168,224,0.5)' },
  gateContent: { flex: 1, alignItems: 'center', paddingTop: 60, paddingBottom: 160 },
  appLabel: { position: 'absolute', top: 20, left: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  appIconSmall: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  appBlockingLabel: { fontFamily: Fonts.inter.regular, fontSize: 9, letterSpacing: 1.5, color: Colors.teal, textTransform: 'uppercase', marginBottom: 1 },
  appName: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, color: Colors.lavender },
  heartContainer: { position: 'absolute', top: 20, right: 16, zIndex: 5 },
  mantraArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, zIndex: 1 },
  mantraLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.micro, letterSpacing: 2, color: Colors.teal, marginBottom: 16, textTransform: 'uppercase' },
  mantraText: { fontFamily: Fonts.cormorant.italic, fontSize: 38, color: Colors.cream, textAlign: 'center', lineHeight: 38 * 1.5 },
  progressDots: { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  buttonArea: { position: 'absolute', bottom: 80, left: 28, right: 28, gap: 12 },
  chantButton: { borderRadius: Radius.pill, paddingVertical: 17, alignItems: 'center' },
  chantButtonText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.buttonLarge, color: Colors.tealDark },
  closeButton: { borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.closeBorder },
  closeButtonText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.buttonLarge, color: Colors.ghostText },
  choiceSplit: { flexDirection: 'row', gap: 10 },
  choicePill: { flex: 1, borderRadius: Radius.pill, paddingVertical: 17, alignItems: 'center' },
  choiceGhost: { borderWidth: 1, borderColor: 'rgba(216,180,254,0.25)' },
  choiceGhostText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.buttonMedium, color: Colors.cream },
  choiceSolid: { backgroundColor: Colors.teal },
  choiceSolidText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.buttonMedium, color: Colors.tealDark },
  tooltipWrapper: { position: 'absolute', left: 24, right: 24, zIndex: 30, alignItems: 'center' },
  tooltip: { backgroundColor: Colors.tooltipBg, borderWidth: 1, borderColor: Colors.tooltipBorder, borderRadius: 16, padding: 16, maxWidth: 280, width: '100%' },
  tooltipText: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.label, color: Colors.cream, lineHeight: FontSizes.label * 1.55, marginBottom: 12 },
  tooltipButton: { backgroundColor: Colors.teal, borderRadius: Radius.pill, paddingVertical: 10, alignItems: 'center' },
  tooltipButtonText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.label, color: Colors.tealDark },
});
