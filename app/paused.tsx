import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, PillButton, PulseRings } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { PRODUCTS, PRICING } from '@/lib/revenuecat';

export default function PausedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const plans = [
    { id: PRODUCTS.BASE_ANNUAL, label: 'Base', price: '$39/yr', sub: '$3.25/mo' },
    { id: PRODUCTS.PRO_ANNUAL, label: 'Pro', price: '$59/yr', sub: '$4.92/mo', highlight: true },
    { id: PRODUCTS.PRO_LIFETIME, label: 'Lifetime', price: '$89', sub: 'one-time' },
  ];

  return (
    <GradientBackground>
      <View style={[styles.container, { paddingTop: insets.top + 80 }]}>
        <PulseRings
          outerSize={200}
          innerSize={150}
          outerColor="rgba(126,200,192,0.06)"
          innerColor="rgba(126,200,192,0.04)"
        />

        <View style={styles.content}>
          <Text style={styles.headline}>
            Abundance is waiting for you.
          </Text>
          <Text style={styles.body}>
            Whenever you're ready to come back, your practice picks up right where you left off.
          </Text>
        </View>

        {/* Plan tiles */}
        <View style={styles.planRow}>
          {plans.map((plan) => (
            <View
              key={plan.id}
              style={[styles.planTile, plan.highlight && styles.planTileHighlight]}
            >
              <Text style={styles.planLabel}>{plan.label}</Text>
              <Text style={styles.planPrice}>{plan.price}</Text>
              <Text style={styles.planSub}>{plan.sub}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 48 }]}>
          <PillButton
            label="Come back"
            onPress={() => {
              // TODO: Trigger RevenueCat purchase flow
              router.replace('/(auth)/paywall');
            }}
          />
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: 40,
  },
  headline: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.displayMedium,
    color: Colors.cream,
    textAlign: 'center',
    lineHeight: FontSizes.displayMedium * LineHeights.snug,
    marginBottom: 16,
  },
  body: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.body,
    color: Colors.mauve,
    textAlign: 'center',
    lineHeight: FontSizes.body * LineHeights.body,
  },
  planRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
    width: '100%',
  },
  planTile: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.12)',
    borderRadius: Radius.tile,
    padding: 16,
    alignItems: 'center',
  },
  planTileHighlight: {
    borderColor: Colors.teal,
    backgroundColor: Colors.planSelectedBg,
  },
  planLabel: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
    marginBottom: 4,
  },
  planPrice: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: 22,
    color: Colors.cream,
  },
  planSub: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: Colors.mauve,
    marginTop: 2,
  },
  bottomSection: {
    width: '100%',
  },
});
