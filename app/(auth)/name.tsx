import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GradientBackground, PillButton } from '@/components/ui';
import { Colors, Fonts, FontSizes, LineHeights, Spacing, Radius } from '@/constants';
import { useOnboardingStore } from '@/lib/store';

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, setUserName } = useOnboardingStore();

  return (
    <GradientBackground showStars={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
          <Text style={styles.headline}>What should we call you?</Text>
          <Text style={styles.body}>
            We'll greet you by name each time you open the app.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Your first name"
            placeholderTextColor="rgba(196,168,224,0.4)"
            value={userName}
            onChangeText={setUserName}
            autoCapitalize="words"
            autoCorrect={false}
            autoFocus
            underlineColorAndroid="transparent"
            returnKeyType="next"
            onSubmitEditing={() => {
              if (userName.trim().length > 0) router.push('/(auth)/goals');
            }}
          />
        </View>

        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 48 }]}>
          <PillButton
            label="Continue"
            onPress={() => router.push('/(auth)/goals')}
            disabled={userName.trim().length === 0}
          />
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing['3xl'],
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
    marginBottom: 32,
  },
  input: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.2)',
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingHorizontal: Spacing['3xl'],
    paddingTop: 24,
  },
});
