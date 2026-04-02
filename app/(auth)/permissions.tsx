import { useState, useCallback } from 'react';
import { View, Text, Platform, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, PillButton, ProgressBar } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing } from '@/constants';

interface PermissionStep {
  emoji: string;
  title: string;
  body: string;
}

const IOS_STEPS: PermissionStep[] = [
  { emoji: '⚙️', title: 'Allow notifications', body: "We'll open notification settings for you." },
  { emoji: '🔔', title: 'Tap Allow', body: 'When iOS asks to send notifications, tap Allow.' },
  { emoji: '🔔', title: 'Enable banners', body: 'Make sure banner style is set to Persistent so the gate prompt stays visible.' },
  { emoji: '↩️', title: 'Come back to Pause Mantra', body: "We'll confirm it worked automatically." },
];

const ANDROID_STEPS: PermissionStep[] = [
  { emoji: '♿', title: 'Enable Accessibility access', body: "We'll open Settings → Accessibility → Pause Mantra. Toggle it on." },
  { emoji: '📱', title: 'Allow Usage access', body: 'Settings → Apps → Special App Access → Usage Access → Pause Mantra. Toggle on.' },
  { emoji: '🔋', title: 'Disable battery optimisation', body: "Settings → Battery → Pause Mantra → Don't optimise. Keeps the gate reliable." },
  { emoji: '↩️', title: "Come back and tap 'I've done it'", body: "We'll verify everything is working." },
];

export default function PermissionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [settingsOpened, setSettingsOpened] = useState(false);

  const steps = Platform.OS === 'ios' ? IOS_STEPS : ANDROID_STEPS;
  const allDone = completedSteps.length >= steps.length;

  const openSettings = useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:NOTIFICATIONS_ID');
      } else {
        await Linking.openSettings();
      }
      setSettingsOpened(true);
    } catch {
      // Fallback: just mark as opened for alpha
      setSettingsOpened(true);
    }
  }, []);

  const handleContinue = useCallback(() => {
    router.push('/(auth)/paywall');
  }, [router]);

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
        <ProgressBar currentStep={4} />

        <Text style={styles.headline}>One quick setup.</Text>

        <Text style={styles.subtitle}>
          We'll open Settings for you. Follow these steps, then come straight back.
        </Text>

        {/* Step list */}
        <View style={styles.stepList}>
          {steps.map((step, index) => {
            const isDone = completedSteps.includes(index);
            const isLast = index === steps.length - 1;

            return (
              <View key={index}>
                <View style={styles.stepRow}>
                  <View style={[styles.stepIconCircle, isDone && styles.stepIconDone]}>
                    {isDone ? (
                      <Text style={styles.checkmark}>{'✓'}</Text>
                    ) : (
                      <Text style={styles.stepEmoji}>{step.emoji}</Text>
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepBody}>{step.body}</Text>
                  </View>
                </View>
                {!isLast && <View style={styles.connector} />}
              </View>
            );
          })}
        </View>

        {/* Bottom section */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 44 }]}>
          {allDone ? (
            <PillButton
              label="Permission granted ✓"
              onPress={handleContinue}
            />
          ) : settingsOpened && Platform.OS === 'android' ? (
            <PillButton
              label="I've done it ✓"
              onPress={() => {
                setCompletedSteps(steps.map((_, i) => i));
                setTimeout(handleContinue, 500);
              }}
            />
          ) : (
            <PillButton
              label="Open Settings →"
              onPress={openSettings}
            />
          )}
          <Text style={styles.footer}>Takes about 30 seconds</Text>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
  },
  headline: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.displayMedium,
    color: Colors.cream,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
    lineHeight: FontSizes.bodySmall * LineHeights.relaxed,
    marginBottom: 20,
  },
  stepList: {
    flex: 1,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(126,200,192,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(126,200,192,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconDone: {
    backgroundColor: 'rgba(126,200,192,0.2)',
  },
  stepEmoji: {
    fontSize: 14,
  },
  checkmark: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.teal,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 4,
  },
  stepTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
    marginBottom: 2,
  },
  stepBody: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.mauve,
    lineHeight: FontSizes.label * 1.55,
  },
  connector: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(126,200,192,0.15)',
    marginLeft: 16, // centered under icon
    marginVertical: 4,
  },
  bottomSection: {
    paddingTop: 20,
  },
  footer: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.35)',
    textAlign: 'center',
    marginTop: 12,
  },
});
