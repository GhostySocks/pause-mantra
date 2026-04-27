import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { GradientBackground, PulseRings, LockIcon } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing } from '@/constants';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function SplashScreenRoute() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const lockScale = useRef(new Animated.Value(0.6)).current;
  const lockOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkY = useRef(new Animated.Value(8)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(6)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  const easing = Easing.bezier(0.16, 1, 0.3, 1);

  useEffect(() => {
    SplashScreen.hideAsync();

    // Lock icon — 400ms delay
    Animated.parallel([
      Animated.timing(lockScale, { toValue: 1, duration: 700, delay: 400, easing, useNativeDriver: true }),
      Animated.timing(lockOpacity, { toValue: 1, duration: 700, delay: 400, easing, useNativeDriver: true }),
    ]).start();

    // Wordmark — 750ms delay
    Animated.parallel([
      Animated.timing(wordmarkY, { toValue: 0, duration: 700, delay: 750, easing, useNativeDriver: true }),
      Animated.timing(wordmarkOpacity, { toValue: 1, duration: 700, delay: 750, easing, useNativeDriver: true }),
    ]).start();

    // Tagline — 1050ms delay
    Animated.parallel([
      Animated.timing(taglineY, { toValue: 0, duration: 600, delay: 1050, easing, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, delay: 1050, easing, useNativeDriver: true }),
    ]).start();

    // Check for existing session or create anonymous one, then navigate
    const timeout = setTimeout(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Existing session — restore auth state
          setAuth(session.user.id, session.user.user_metadata?.name ?? null);
        } else {
          // No session — sign in anonymously
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Anonymous sign-in failed:', error.message);
          } else if (data.user) {
            setAuth(data.user.id, null);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }

      // Route based on auth state
      const state = useAuthStore.getState();
      if (!state.isAuthenticated) {
        router.replace('/(auth)/welcome');
        return;
      }

      // Log daily app open for streak tracking
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: existingOpen } = await supabase
        .from('gate_events')
        .select('id')
        .eq('user_id', state.userId)
        .eq('app_name', 'app_open')
        .gte('created_at', todayStr + 'T00:00:00')
        .limit(1);

      if (!existingOpen || existingOpen.length === 0) {
        await supabase.from('gate_events').insert({
          user_id: state.userId,
          app_name: 'app_open',
          outcome: 'entered',
        });
      }

      // Check if user has completed onboarding (has saved goals)
      const { data: goals } = await supabase
        .from('user_goals')
        .select('id')
        .eq('user_id', state.userId)
        .limit(1);

      if (!goals || goals.length === 0) {
        // New user — send through onboarding
        router.replace('/(auth)/welcome');
      } else if (state.subscriptionStatus === 'paused') {
        router.replace('/paused');
      } else {
        router.replace('/(tabs)');
      }
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <GradientBackground>
      <View style={styles.container}>
        <PulseRings
          outerSize={260}
          innerSize={200}
          outerColor="rgba(126,200,192,0.25)"
          innerColor="rgba(126,200,192,0.15)"
          duration={5000}
          innerDelay={800}
        />

        <View style={styles.content}>
          <Animated.View style={{ transform: [{ scale: lockScale }], opacity: lockOpacity }}>
            <LockIcon size={52} color={Colors.teal} />
          </Animated.View>

          <Animated.Text style={[styles.wordmark, { transform: [{ translateY: wordmarkY }], opacity: wordmarkOpacity }]}>
            Pause Mantra
          </Animated.Text>

          <Animated.Text style={[styles.tagline, { transform: [{ translateY: taglineY }], opacity: taglineOpacity }]}>
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
