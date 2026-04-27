import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { GradientBackground, PillButton, ProgressBar } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { SUGGESTED_APPS, type SuggestedApp } from '@/constants/apps';
import { useOnboardingStore, useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function AppsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromSettings = from === 'settings';
  const { selectedApps, toggleApp } = useOnboardingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredApps = SUGGESTED_APPS.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasSelection = selectedApps.length > 0;
  const isSelected = (app: SuggestedApp) =>
    selectedApps.some((a) => a.name === app.name);

  return (
    <GradientBackground showStars={false}>
      <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
        {!isFromSettings && <ProgressBar currentStep={2} />}

        <Text style={styles.headline}>
          {isFromSettings ? 'Update your\ngated apps' : 'Which apps steal\nyour time?'}
        </Text>

        <Text style={styles.subtitle}>
          Select the ones you want to gate. You can always change this later.
        </Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={8} stroke={Colors.mauve} strokeWidth={2} />
            <Path d="M21 21l-4.35-4.35" stroke={Colors.mauve} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={styles.searchInput}
            placeholder="Search apps..."
            placeholderTextColor="rgba(196,168,224,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* App list */}
        <FlatList
          data={filteredApps}
          keyExtractor={(item) => item.name}
          showsVerticalScrollIndicator={false}
          style={styles.listArea}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
          renderItem={({ item: app }) => {
            const selected = isSelected(app);
            return (
              <Pressable
                onPress={() =>
                  toggleApp({
                    id: app.bundleId,
                    name: app.name,
                    emoji: app.emoji,
                    color: app.color,
                    bundleId: app.bundleId,
                    packageName: app.packageName,
                  })
                }
                style={[styles.appRow, selected && styles.appRowSelected]}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Text style={styles.appEmoji}>{app.emoji}</Text>
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.name}</Text>
                  <Text style={styles.appCategory}>{app.category}</Text>
                </View>
                <View style={[styles.checkCircle, selected && styles.checkCircleSelected]}>
                  {selected && (
                    <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                      <Path d="M5 13l4 4L19 7" stroke={Colors.tealDark} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
              </Pressable>
            );
          }}
        />

        {/* Bottom section */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 44 }]}>
          <View style={styles.bottomRow}>
            <Pressable onPress={() => setShowAll(!showAll)}>
              <Text style={styles.showAllLink}>
                {showAll ? 'Show suggestions only' : 'Show all apps'}
              </Text>
            </Pressable>
            <Text style={styles.selectedCount}>
              {selectedApps.length} app{selectedApps.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
          <PillButton
            label={isFromSettings ? 'Save' : 'Continue'}
            onPress={async () => {
              if (isFromSettings) {
                const { userId } = useAuthStore.getState();
                if (userId) {
                  // Replace all gated apps in Supabase
                  await supabase.from('user_gated_apps').delete().eq('user_id', userId);
                  if (selectedApps.length > 0) {
                    await supabase.from('user_gated_apps').insert(
                      selectedApps.map((app) => ({
                        user_id: userId,
                        app_name: app.name,
                        bundle_id: app.bundleId || null,
                        package_name: app.packageName || null,
                      }))
                    );
                  }
                }
                router.back();
              } else {
                router.push('/(auth)/demo');
              }
            }}
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
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.searchBorder,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 8,
  },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: Radius.input,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  appRowSelected: {
    backgroundColor: 'rgba(126,200,192,0.1)',
    borderColor: 'rgba(126,200,192,0.25)',
  },
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.appIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appEmoji: {
    fontSize: 16,
  },
  appInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appName: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  appCategory: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.5)',
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleSelected: {
    backgroundColor: Colors.teal,
    borderColor: Colors.teal,
  },
  bottomSection: {
    paddingTop: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  showAllLink: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.teal,
  },
  selectedCount: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.mauve,
  },
});
