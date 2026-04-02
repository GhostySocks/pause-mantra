import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { GradientBackground, PulseRings, LockIcon } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing } from '@/constants';
import { useAuthStore } from '@/lib/store';

const ENTRANCE_EASING = Easing.bezier(0.16, 1, 0.3, 1);

export default function SplashScreenRoute() {
  const router = useRouter();
  const { isAuthenticated, subscriptionStatus } = useAuthStore();

  // Animation values
  const lockScale = useSharedValue(0.6);
  const lockOpacity = useSharedValue(0);
  const wordmarkY = useSharedValue(8);
  const wordmarkOpacity = useSharedValue(0);
  const taglineY = useSharedValue(6);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Hide native splash
    SplashScreen.hideAsync();

    // Lock icon — 400ms delay, 700ms duration
    lockScale.value = withDelay(
      400,
      withTiming(1, { duration: 700, easing: ENTRANCE_EASING })
    );
    lockOpacity.value = withDelay(
      400,
      withTiming(1, { duration: 700, easing: ENTRANCE_EASING })
    );

    // Wordmark — 750ms delay, 700ms duration
    wordmarkY.value = withDelay(
      750,
      withTiming(0, { duration: 700, easing: ENTRANCE_EASING })
    );
    wordmarkOpacity.value = withDelay(
      750,
      withTiming(1, { duration: 700, easing: ENTRANCE_EASING })
    );

    // Tagline — 1050ms delay, 600ms duration
    taglineY.value = withDelay(
      1050,
      withTiming(0, { duration: 600, easing: ENTRANCE_EASING })
    );
    taglineOpacity.value = withDelay(
      1050,
      withTiming(1, { duration: 600, easing: ENTRANCE_EASING })
    );

    // Navigate after ~1.8s
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        router.replace('/(auth)/welcome');
      } else if (subscriptionStatus === 'paused') {
        router.replace('/paused');
      } else {
        router.replace('/(tabs)');
      }
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  const lockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: lockScale.value }],
    opacity: lockOpacity.value,
  }));

  const wordmarkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: wordmarkY.value }],
    opacity: wordmarkOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: taglineY.value }],
    opacity: taglineOpacity.value,
  }));

  return (
    <GradientBackground>
      <View style={styles.container}>
        <PulseRings
          outerSize={260}
          innerSize={200}
          outerColor={Colors.splashRingOuter}
          innerColor={Colors.splashRingInner}
          duration={5000}
          innerDelay={800}
        />

        <View style={styles.content}>
          <Animated.View style={lockAnimatedStyle}>
            <LockIcon size={52} color={Colors.teal} />
          </Animated.View>

          <Animated.Text style={[styles.wordmark, wordmarkAnimatedStyle]}>
            Pause Mantra
          </Animated.Text>

          <Animated.Text style={[styles.tagline, taglineAnimatedStyle]}>
            MINDFUL BY DESIGN
          </Animated.Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 20,
    zIndex: 1,
  },
  wordmark: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.wordmark,
    color: Colors.cream,
    letterSpacing: LetterSpacing.wordmark,
  },
  tagline: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
    letterSpacing: LetterSpacing.eyebrow,
    textTransform: 'uppercase',
  },
});
