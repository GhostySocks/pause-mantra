import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, GlassCard } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, Spacing, Radius } from '@/constants';
import { useAuthStore, useSettingsStore, useOnboardingStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { SUGGESTED_APPS } from '@/constants/apps';
import type { GatedApp } from '@/types';

const DELAY_OPTIONS = [0, 3, 5, 10];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, subscriptionTier, userId } = useAuthStore();
  const { gateDelaySeconds, setGateDelay, reflectionPromptsEnabled, setReflectionPrompts } = useSettingsStore();
  const { selectedApps, toggleApp, selectedGoals, setGoals, setApps } = useOnboardingStore();
  const { userName, setAuth } = useAuthStore();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(userName ?? '');
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [removeAppConfirm, setRemoveAppConfirm] = useState<typeof selectedApps[0] | null>(null);

  // Load goals and apps from Supabase on mount
  useEffect(() => {
    if (!userId || loadedFromDb) return;

    (async () => {
      // Fetch goals
      const { data: goals } = await supabase
        .from('user_goals')
        .select('goal')
        .eq('user_id', userId);

      if (goals && goals.length > 0) {
        setGoals(goals.map((g) => g.goal));
      }

      // Fetch gated apps
      const { data: apps } = await supabase
        .from('user_gated_apps')
        .select('app_name, bundle_id, package_name')
        .eq('user_id', userId);

      if (apps) {
        const appMap = new Map(SUGGESTED_APPS.map((sa) => [sa.name, sa]));
        setApps(apps.map((a) => {
          const suggested = appMap.get(a.app_name);
          return {
            id: a.bundle_id ?? a.app_name,
            name: a.app_name,
            emoji: suggested?.emoji ?? '',
            color: suggested?.color ?? '',
            bundleId: a.bundle_id ?? '',
            packageName: a.package_name ?? '',
          };
        }));
      }

      // Fetch settings (gate delay, reflection prompts)
      const { data: settings } = await supabase
        .from('user_settings')
        .select('gate_delay_seconds, reflection_prompts_enabled')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (settings) {
        setGateDelay(settings.gate_delay_seconds);
        setReflectionPrompts(settings.reflection_prompts_enabled);
      }

      // Load name from user metadata
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.name) {
        setNameValue(user.user_metadata.name);
        setAuth(userId, user.user_metadata.name);
      }

      setLoadedFromDb(true);
    })();
  }, [userId]);

  const syncSetting = (field: string, value: unknown): void => {
    if (!userId) return;
    supabase
      .from('user_settings')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .then(({ error }) => {
        if (error) console.warn(`Failed to sync ${field}:`, error.message);
      });
  };

  const handleRemoveApp = (app: typeof selectedApps[0]) => {
    setRemoveAppConfirm(app);
  };

  const confirmRemoveApp = () => {
    if (!removeAppConfirm) return;
    toggleApp(removeAppConfirm);
    if (userId) {
      supabase
        .from('user_gated_apps')
        .delete()
        .eq('user_id', userId)
        .eq('app_name', removeAppConfirm.name)
        .then(({ error }) => {
          if (error) console.warn('Failed to remove app from Supabase:', error.message);
        });
    }
    setRemoveAppConfirm(null);
  };

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenLabel}>SETTINGS</Text>
        <Text style={styles.screenTitle}>Your setup</Text>

        {/* Name */}
        <Text style={styles.sectionLabel}>YOUR NAME</Text>
        <GlassCard style={styles.section} borderRadius={16} padding={16}>
          {editingName ? (
            <>
              <TextInput
                style={styles.nameInput}
                value={nameValue}
                onChangeText={setNameValue}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus
                blurOnSubmit
                placeholderTextColor="rgba(196,168,224,0.4)"
                placeholder="Your first name"
                returnKeyType="done"
                onBlur={() => {
                  const trimmed = nameValue.trim();
                  if (trimmed && userId) {
                    supabase.auth.updateUser({ data: { name: trimmed } }).then(() => {
                      setAuth(userId, trimmed);
                      setEditingName(false);
                    });
                  } else {
                    setEditingName(false);
                  }
                }}
              />
              <Text style={styles.nameHint}>Tap Done on keyboard to save</Text>
            </>
          ) : (
            <Pressable style={styles.nameRow} onPress={() => setEditingName(true)} hitSlop={12}>
              <Text style={styles.nameDisplay}>{nameValue || 'Add your name'}</Text>
              <View style={styles.nameEditButton}>
                <Text style={styles.nameEditLink}>Edit</Text>
              </View>
            </Pressable>
          )}
        </GlassCard>

        {/* Gated Apps */}
        <Text style={styles.sectionLabel}>GATED APPS</Text>
        <GlassCard style={styles.section} borderRadius={16} padding={16}>
          {selectedApps.length > 0 ? (
            selectedApps.map((app) => (
              <View key={app.name} style={styles.appRow}>
                <Text style={styles.appEmoji}>{app.emoji}</Text>
                <Text style={styles.appName}>{app.name}</Text>
                <Pressable onPress={() => handleRemoveApp(app)} hitSlop={10}>
                  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                    <Path d="M6 18L18 6M6 6l12 12" stroke="rgba(196,168,224,0.4)" strokeWidth={1.5} strokeLinecap="round" />
                  </Svg>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={styles.noAppsText}>No apps gated yet</Text>
          )}
          <Pressable
            style={styles.addAppRow}
            onPress={() => router.push({ pathname: '/(auth)/apps', params: { from: 'settings' } })}
          >
            <Text style={styles.addAppText}>+ Add an app</Text>
          </Pressable>
        </GlassCard>

        {/* Mantra Categories */}
        <Text style={styles.sectionLabel}>MANTRA CATEGORIES</Text>
        <GlassCard style={styles.section} borderRadius={16} padding={16}>
          <Text style={styles.settingTitle}>Your interests</Text>
          {selectedGoals.length > 0 ? (
            <View style={styles.bulletList}>
              {selectedGoals.map((goal) => (
                <View key={goal} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>{'·'}</Text>
                  <Text style={styles.bulletText}>{goal}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.settingDesc}>No categories selected</Text>
          )}
          <Pressable
            style={styles.addAppRow}
            onPress={() => router.push({ pathname: '/(auth)/goals', params: { from: 'settings' } })}
          >
            <Text style={styles.addAppText}>Change categories</Text>
          </Pressable>
        </GlassCard>

        {/* Gate Behaviour */}
        <Text style={styles.sectionLabel}>GATE BEHAVIOUR</Text>
        <GlassCard style={styles.section} borderRadius={16} padding={16}>
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
                onPress={() => { setGateDelay(seconds); syncSetting('gate_delay_seconds', seconds); }}
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
                syncSetting('reflection_prompts_enabled', v);
              }}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.teal }}
              thumbColor={Colors.cream}
            />
          </View>
        </GlassCard>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <GlassCard style={styles.section} borderRadius={16} padding={16}>
          <Pressable style={styles.accountRow} onPress={() => router.push({ pathname: '/(auth)/permissions', params: { from: 'settings' } })}>
            <Text style={styles.accountLabel}>Permissions</Text>
            <View style={styles.accountRight}>
              <Text style={styles.accountValue}>Review setup</Text>
              <Text style={styles.chevron}>{'›'}</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.accountRow}
            onPress={() => router.push('/(auth)/paywall')}
          >
            <Text style={styles.accountLabel}>Subscription</Text>
            <View style={styles.accountRight}>
              <Text style={styles.accountValue}>
                {subscriptionTier === 'pro' ? 'Pro' : 'Base'} (Trial)
              </Text>
              <Text style={styles.chevron}>{'›'}</Text>
            </View>
          </Pressable>

          <Pressable
            style={styles.accountRow}
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be available at pausemantra.com/privacy before launch.')}
          >
            <Text style={styles.accountLabel}>Privacy policy</Text>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable
            style={styles.accountRow}
            onPress={() => Alert.alert('Export Data', 'Data export will be available when Supabase is connected. Your data will be emailed to you as a JSON file.')}
          >
            <Text style={styles.accountLabel}>Export my data</Text>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>

          <Pressable
            style={[styles.accountRow, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert(
              'Delete Account',
              'This will permanently delete your account and all data. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: async () => {
                  if (!userId) return;
                  // Delete all user data from each table
                  const tables = ['gate_notes', 'gate_events', 'liked_mantras', 'seen_mantras', 'master_mantras', 'user_gated_apps', 'user_goals', 'user_settings'];
                  for (const table of tables) {
                    await supabase.from(table).delete().eq('user_id', userId);
                  }
                  // Sign out
                  await supabase.auth.signOut();
                  useAuthStore.getState().clearAuth();
                  router.replace('/');
                }},
              ]
            )}
          >
            <Text style={[styles.accountLabel, { color: '#E57373' }]}>Delete account</Text>
            <Text style={styles.chevron}>{'›'}</Text>
          </Pressable>
        </GlassCard>

        <Text style={styles.versionText}>Pause Mantra v1.0.0</Text>
      </ScrollView>

      {/* Remove app confirmation overlay */}
      {removeAppConfirm && (
        <>
          <Pressable style={styles.confirmBackdrop} onPress={() => setRemoveAppConfirm(null)} />
          <View style={styles.confirmOverlay} pointerEvents="box-none">
            <View style={styles.confirmCard}>
              <Text style={styles.confirmTitle}>Remove {removeAppConfirm.name}?</Text>
              <Text style={styles.confirmBody}>
                {removeAppConfirm.name} will no longer be gated. You can add it back anytime.
              </Text>
              <View style={styles.confirmButtons}>
                <Pressable
                  style={styles.confirmCancel}
                  onPress={() => setRemoveAppConfirm(null)}
                >
                  <Text style={styles.confirmCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={styles.confirmRemove}
                  onPress={confirmRemoveApp}
                >
                  <Text style={styles.confirmRemoveText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}
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
  noAppsText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: 'rgba(196,168,224,0.5)',
    textAlign: 'center',
    paddingVertical: 12,
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
  bulletList: {
    marginTop: 8,
    gap: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.body,
    color: Colors.teal,
  },
  bulletText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameDisplay: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  nameEditButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(126,200,192,0.12)',
  },
  nameEditLink: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.teal,
  },
  nameInput: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(126,200,192,0.3)',
    borderRadius: Radius.pill,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  nameHint: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.4)',
    marginTop: 6,
  },
  versionText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.3)',
    textAlign: 'center',
    marginTop: 8,
  },

  // Confirm overlay
  confirmBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 20,
  },
  confirmOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 21,
  },
  confirmCard: {
    backgroundColor: Colors.tooltipBg,
    borderWidth: 1,
    borderColor: Colors.tooltipBorder,
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  confirmTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    color: Colors.cream,
    marginBottom: 8,
  },
  confirmBody: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.mauve,
    lineHeight: FontSizes.label * 1.55,
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmCancel: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.25)',
  },
  confirmCancelText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  confirmRemove: {
    flex: 1,
    borderRadius: Radius.pill,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
  confirmRemoveText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: '#FFFFFF',
  },
});
