import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { GradientBackground, PillButton } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';

const PROOF_POINTS = [
  { icon: 'shield', label: 'Gate any app behind a mantra' },
  { icon: 'book', label: '10,000+ affirmations, curated for you' },
  { icon: 'clock', label: 'Takes 30 seconds to set up' },
];

function ProofPointIcon({ name }: { name: string }) {
  const color = Colors.teal;
  const size = 14;
  switch (name) {
    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2l8 4v6c0 5.25-3.4 10.74-8 12-4.6-1.26-8-6.75-8-12V6l8-4z" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'book':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color} strokeWidth={2} strokeLinecap="round" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={color} strokeWidth={2} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
          <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
    default:
      return null;
  }
}

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brandLabel}>PAUSE MANTRA</Text>

        <Text style={styles.headline}>
          Every time you reach for your phone, reach inward first.
        </Text>

        <Text style={styles.body}>
          Pause Mantra turns mindless app-opens into moments of intention — one mantra at a time.
        </Text>

        <View style={styles.proofPoints}>
          {PROOF_POINTS.map((point) => (
            <View key={point.icon} style={styles.proofRow}>
              <View style={styles.proofIconCircle}>
                <ProofPointIcon name={point.icon} />
              </View>
              <Text style={styles.proofLabel}>{point.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 48 }]}>
        <PillButton
          label="Begin your practice"
          onPress={() => router.push('/(auth)/goals')}
        />
        <Text style={styles.subLabel}>
          7-day free trial {'\u00b7'} No card required
        </Text>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing['3xl'],
    flexGrow: 1,
  },
  brandLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    letterSpacing: LetterSpacing.eyebrow,
    color: Colors.teal,
    marginBottom: 20,
  },
  headline: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.displayLarge,
    color: Colors.cream,
    lineHeight: FontSizes.displayLarge * LineHeights.tight,
    marginBottom: 16,
  },
  body: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.body,
    color: Colors.mauve,
    lineHeight: FontSizes.body * LineHeights.body,
    marginBottom: 28,
  },
  proofPoints: {
    gap: 12,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proofIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.iconCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.lavender,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: Spacing['3xl'],
  },
  subLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: 'rgba(196,168,224,0.5)',
    textAlign: 'center',
    marginTop: 12,
  },
});
