import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { PulseRings } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, Spacing, Radius } from '@/constants';
import { useSettingsStore } from '@/lib/store';

const ENTRANCE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

const CHANT_STEPS = [
  { label: 'I said this once', color: Colors.chant.step0 },
  { label: 'I said this again', color: Colors.chant.step1 },
  { label: 'I said this three times', color: Colors.chant.step2 },
];

interface GateScreenProps {
  appName: string;
  appEmoji: string;
  mantraText: string;
  mantraId: string;
  onEnter: () => void;
  onClose: () => void;
  onHeart: (mantraId: string) => void;
}

export function GateScreen({
  appName,
  appEmoji,
  mantraText,
  mantraId,
  onEnter,
  onClose,
  onHeart,
}: GateScreenProps) {
  const { gateDelaySeconds } = useSettingsStore();
  const [chantStep, setChantStep] = useState(0);
  const [showChoice, setShowChoice] = useState(false);
  const [heartFilled, setHeartFilled] = useState(false);
  const [buttonReady, setButtonReady] = useState(gateDelaySeconds === 0);

  // "I read this" delay timer
  useEffect(() => {
    if (gateDelaySeconds > 0) {
      const timer = setTimeout(() => setButtonReady(true), gateDelaySeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [gateDelaySeconds]);

  // Button entrance animation
  const buttonScale = useSharedValue(0.82);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    buttonScale.value = withTiming(1, { duration: 900, easing: ENTRANCE_EASING });
    buttonOpacity.value = withTiming(1, { duration: 900, easing: ENTRANCE_EASING });
  }, [chantStep]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  // Choice split animation
  const choiceScale = useSharedValue(0.82);
  const choiceOpacity = useSharedValue(0);

  useEffect(() => {
    if (showChoice) {
      choiceScale.value = withTiming(1, { duration: 1100, easing: ENTRANCE_EASING });
      choiceOpacity.value = withTiming(1, { duration: 1100, easing: ENTRANCE_EASING });
    }
  }, [showChoice]);

  const choiceAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: choiceScale.value }],
    opacity: choiceOpacity.value,
  }));

  const handleChant = useCallback(() => {
    if (!buttonReady) return;

    if (chantStep < 2) {
      // Reset animation for next step
      buttonScale.value = 0.82;
      buttonOpacity.value = 0;
      setChantStep(chantStep + 1);
    } else {
      // Third tap — show choice split
      setShowChoice(true);
    }
  }, [chantStep, buttonReady]);

  const handleHeart = useCallback(() => {
    setHeartFilled(!heartFilled);
    onHeart(mantraId);
  }, [heartFilled, mantraId, onHeart]);

  return (
    <View style={styles.container}>
      {/* App label */}
      <View style={styles.appLabel}>
        <View style={styles.appIconSmall}>
          <Text style={{ fontSize: 16 }}>{appEmoji}</Text>
        </View>
        <Text style={styles.appName}>{appName}</Text>
      </View>

      {/* Heart button */}
      <View style={styles.heartContainer}>
        <HeartButton filled={heartFilled} onPress={handleHeart} />
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
        <Text style={styles.mantraText}>{mantraText}</Text>

        {/* Progress dots */}
        <View style={styles.progressDots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i <= chantStep && (chantStep > 0 || showChoice)
                      ? Colors.progressDotActive
                      : Colors.progressDotInactive,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonArea}>
        {!showChoice ? (
          <>
            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleChant}
                disabled={!buttonReady}
                style={[
                  styles.chantButton,
                  {
                    backgroundColor: buttonReady
                      ? CHANT_STEPS[chantStep].color
                      : Colors.buttonInactiveBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chantButtonText,
                    { color: buttonReady ? Colors.tealDark : Colors.buttonInactiveText },
                  ]}
                >
                  {CHANT_STEPS[chantStep].label}
                </Text>
              </Pressable>
            </Animated.View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </>
        ) : (
          <Animated.View style={[styles.choiceSplit, choiceAnimatedStyle]}>
            <Pressable onPress={onClose} style={[styles.choicePill, styles.choiceGhost]}>
              <Text style={styles.choiceGhostText}>Keep it locked</Text>
            </Pressable>
            <Pressable onPress={onEnter} style={[styles.choicePill, styles.choiceSolid]}>
              <Text style={styles.choiceSolidText}>Open for 1 hour</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appLabel: {
    position: 'absolute',
    top: 60,
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
    top: 56,
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
});
