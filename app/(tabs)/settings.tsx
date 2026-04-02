import { View, Text, Pressable, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { GradientBackground } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, Spacing, Radius } from '@/constants';
import { useAuthStore, useSettingsStore } from '@/lib/store';

const DELAY_OPTIONS = [0, 3, 5, 10];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, subscriptionTier } = useAuthStore();
  const { gateDelaySeconds, setGateDelay, reflectionPromptsEnabled, setReflectionPrompts } = useSettingsStore();

  // Placeholder gated apps
  const gatedApps = [
    { name: 'Instagram', emoji: '\uD83D\uDCF7' },
    { name: 'TikTok', emoji: '\uD83C\uDFB5' },
    { name: 'Twitter/X', emoji: '\uD835\uDD4F' },
  ];

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenLabel}>SETTINGS</Text>
        <Text style={styles.screenTitle}>Your setup</Text>

        {/* Gated Apps */}
        <Text style={styles.sectionLabel}>GATED APPS</Text>
        <View style={styles.section}>
          {gatedApps.map((app) => (
            <View key={app.name} style={styles.appRow}>
              <Text style={styles.appEmoji}>{app.emoji}</Text>
              <Text style={styles.appName}>{app.name}</Text>
              <Pressable>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 18L18 6M6 6l12 12" stroke="rgba(196,168,224,0.4)" strokeWidth={1.5} strokeLinecap="round" />
                </Svg>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addAppRow}>
            <Text style={styles.addAppText}>+ Add an app</Text>
          </Pressable>
        </View>

        {/* Gate Behaviour */}
        <Text style={styles.sectionLabel}>GATE BEHAVIOUR</Text>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>"I read this" button delay</Text>
              <Text style={styles.settingDesc}>How long before the chant button activates</Text>
            </View>
          </View>
          <View style={styles.delayPicker}>
            {DELAY_OPTIONS.map((seconds) => (
              <Pressable
                key={seconds}
                onPress={() => setGateDelay(seconds)}
                style={[
                  styles.delayOption,
                  gateDelaySeconds === seconds && styles.delayOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.delayText,
                    gateDelaySeconds === seconds && styles.delayTextSelected,
                  ]}
                >
                  {seconds}s
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.settingRow, { marginTop: 16 }]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                Reflection prompts {!isPro && '(Pro)'}
              </Text>
              <Text style={styles.settingDesc}>Show a prompt after each gate choice</Text>
            </View>
            <Switch
              value={reflectionPromptsEnabled}
              onValueChange={(v) => {
                if (!isPro) {
                  Alert.alert('Pro Feature', 'Upgrade to Pro to enable reflection prompts.');
                  return;
                }
                setReflectionPrompts(v);
              }}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.teal }}
              thumbColor={Colors.cream}
            />
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <Pressable style={styles.accountRow}>
            <Text style={styles.accountLabel}>Subscription</Text>
            <View style={styles.accountRight}>
              <Text style={styles.accountValue}>
                {subscriptionTier === 'pro' ? 'Pro' : 'Base'} (Trial)
              </Text>
              <Text style={styles.chevron}>{'\u203A'}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.accountRow}>
            <Text style={styles.accountLabel}>Privacy policy</Text>
            <Text style={styles.chevron}>{'\u203A'}</Text>
          </Pressable>

          <Pressable style={styles.accountRow}>
            <Text style={styles.accountLabel}>Export my data</Text>
            <Text style={styles.chevron}>{'\u203A'}</Text>
          </Pressable>

          <Pressable style={[styles.accountRow, { borderBottomWidth: 0 }]}>
            <Text style={[styles.accountLabel, { color: '#E57373' }]}>Delete account</Text>
            <Text style={styles.chevron}>{'\u203A'}</Text>
          </Pressable>
        </View>

        <Text style={styles.versionText}>Pause Mantra v1.0.0</Text>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  screenLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    letterSpacing: LetterSpacing.eyebrow,
    color: Colors.teal,
    marginBottom: 4,
  },
  screenTitle: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.sectionTitle,
    color: Colors.cream,
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 10,
  },
  section: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.12)',
    borderRadius: Radius.tile,
    padding: 16,
    marginBottom: 24,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  appEmoji: {
    fontSize: 20,
  },
  appName: {
    flex: 1,
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  addAppRow: {
    paddingVertical: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(126,200,192,0.25)',
    borderRadius: Radius.input,
    alignItems: 'center',
    marginTop: 10,
  },
  addAppText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.teal,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  settingDesc: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
    marginTop: 2,
  },
  delayPicker: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  delayOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.15)',
    alignItems: 'center',
  },
  delayOptionSelected: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  delayText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.mauve,
  },
  delayTextSelected: {
    color: Colors.tealDark,
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  accountLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  accountRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountValue: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
  },
  chevron: {
    fontSize: 18,
    color: Colors.mauve,
  },
  versionText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.3)',
    textAlign: 'center',
    marginTop: 8,
  },
});
