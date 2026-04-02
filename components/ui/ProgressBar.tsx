import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes, LetterSpacing, Spacing, Radius } from '@/constants';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

export function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                backgroundColor:
                  i < currentStep ? Colors.progressActive : Colors.progressInactive,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.stepLabel}>
        {`Step ${currentStep} of ${totalSteps}`.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  barContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: Radius.progressBar,
  },
  stepLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    letterSpacing: LetterSpacing.stepLabel,
    color: Colors.textAccent,
  },
});
