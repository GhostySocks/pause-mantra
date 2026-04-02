import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
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

// Placeholder data for alpha
const PLACEHOLDER_MANTRA = {
  id: '1',
  text: 'I am exactly where I need to be, growing in ways I cannot yet see.',
  category: 'Peace',
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName } = useAuthStore();
  const [heartFilled, setHeartFilled] = useState(false);

  const greeting = getGreeting();
  const displayName = userName ?? 'there';

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Text style={styles.greetingLabel}>{greeting}</Text>
        <Text style={styles.greetingName}>{displayName} {'\u2726'}</Text>

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
            onPress={() => router.push('/(tabs)/journal')}
          >
            <Text style={styles.statLabel}>STREAK</Text>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statUnit}>days {'\u2726'}</Text>
          </Pressable>

          <Pressable style={styles.statTile}>
            <Text style={styles.statLabel}>TODAY</Text>
            <Text style={styles.statNumber}>7</Text>
            <Text style={styles.statUnit}>gates {'\u2726'}</Text>
          </Pressable>

          <Pressable
            style={styles.statTile}
            onPress={() => router.push('/(tabs)/library')}
          >
            <Text style={styles.statLabel}>LIKED</Text>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statUnit}>mantras {'\u2726'}</Text>
          </Pressable>
        </View>

        {/* Master Mantra nudge card */}
        <Pressable
          style={styles.masterCard}
          onPress={() => router.push('/master-mantra')}
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
});
