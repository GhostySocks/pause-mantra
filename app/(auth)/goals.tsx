import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, PillButton, ProgressBar } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius, MANTRA_CATEGORIES } from '@/constants';
import { useOnboardingStore } from '@/lib/store';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedGoals, toggleGoal } = useOnboardingStore();
  const hasSelection = selectedGoals.length > 0;

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
        <ProgressBar currentStep={1} />

        <Text style={styles.headline}>
          What do you want more of?
        </Text>

        <Text style={styles.subtitle}>
          Choose as many as you like. We'll match your mantras to what matters most.
        </Text>

        <ScrollView
          contentContainerStyle={styles.chipGrid}
          showsVerticalScrollIndicator={false}
          style={styles.scrollArea}
        >
          {MANTRA_CATEGORIES.map((category) => {
            const selected = selectedGoals.includes(category);
            return (
              <Pressable
                key={category}
                onPress={() => toggleGoal(category)}
                style={[
                  styles.chip,
                  selected && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 44 }]}>
          <PillButton
            label="Continue"
            onPress={() => router.push('/(auth)/apps')}
            disabled={!hasSelection}
          />
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
    lineHeight: FontSizes.displayMedium * LineHeights.snug,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
    lineHeight: FontSizes.bodySmall * LineHeights.relaxed,
    marginBottom: 28,
  },
  scrollArea: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.chipGap,
    alignContent: 'flex-start',
    paddingBottom: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: Radius.pill,
    backgroundColor: Colors.chipBg,
    borderWidth: 1,
    borderColor: Colors.chipBorder,
  },
  chipSelected: {
    backgroundColor: Colors.chipSelectedBg,
    borderColor: Colors.chipSelectedBorder,
  },
  chipText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.lavender,
  },
  chipTextSelected: {
    fontFamily: Fonts.inter.medium,
    color: Colors.chipSelectedText,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
