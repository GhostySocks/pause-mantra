import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, GlassCard, PillButton, ModalSheet } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useHeart } from '@/hooks/useHearts';
import type { Mantra } from '@/types';

function LikedMantraRow({ mantra, onToggle }: { mantra: Mantra; onToggle: () => void }) {
  const { liked, toggle } = useHeart(mantra.id);
  return (
    <View style={styles.likedRow}>
      <View style={styles.likedContent}>
        <Text style={styles.likedMantra}>{mantra.text}</Text>
      </View>
      <HeartButton
        filled={liked}
        onPress={async () => {
          await toggle();
          onToggle();
        }}
        size={16}
      />
    </View>
  );
}

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro, userId } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [likedMantras, setLikedMantras] = useState<Mantra[]>([]);
  const [featuredMantra, setFeaturedMantra] = useState<Mantra | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiked = useCallback(async () => {
    if (!userId) return;

    const { data: liked, error: likedError } = await supabase
      .from('liked_mantras')
      .select('mantra_id')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (likedError) {
      console.warn('Failed to fetch liked mantras:', likedError.message);
      return;
    }
    if (!liked || liked.length === 0) {
      setLikedMantras([]);
      setFeaturedMantra(null);
      return;
    }

    const mantraIds = liked.map((row) => row.mantra_id);
    const { data: mantras, error: mantrasError } = await supabase
      .from('mantras')
      .select('id, text, category')
      .in('id', mantraIds);

    if (mantrasError) {
      console.warn('Failed to fetch mantra details:', mantrasError.message);
      return;
    }

    const mantraMap = new Map((mantras ?? []).map((m) => [m.id, m]));
    const ordered = mantraIds
      .map((id) => mantraMap.get(id))
      .filter((m): m is Mantra => m !== undefined);
    setLikedMantras(ordered);

    // Pick a random featured mantra from liked
    if (ordered.length > 0 && !featuredMantra) {
      setFeaturedMantra(ordered[Math.floor(Math.random() * ordered.length)]);
    }
  }, [userId]);

  useEffect(() => {
    fetchLiked();
  }, [fetchLiked]);

  const shuffleFeatured = useCallback(() => {
    if (likedMantras.length === 0) return;
    setRefreshing(true);
    setFeaturedMantra((current) => {
      if (likedMantras.length === 1) return likedMantras[0];
      // Keep picking until we get a different one
      let next = likedMantras[Math.floor(Math.random() * likedMantras.length)];
      while (next.id === current?.id) {
        next = likedMantras[Math.floor(Math.random() * likedMantras.length)];
      }
      return next;
    });
    setTimeout(() => setRefreshing(false), 300);
  }, [likedMantras]);

  const likedCount = likedMantras.length;

  // Group liked mantras by category
  const likedByCategory: Record<string, Mantra[]> = {};
  for (const m of likedMantras) {
    if (!likedByCategory[m.category]) {
      likedByCategory[m.category] = [];
    }
    likedByCategory[m.category].push(m);
  }
  const categoriesWithLikes = Object.keys(likedByCategory).sort();

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.screenLabel}>LIBRARY</Text>
            <Text style={styles.screenTitle}>Your mantras</Text>
          </View>
          <Text style={styles.likedCountBadge}>{likedCount} liked</Text>
        </View>

        {/* Featured liked mantra */}
        {likedMantras.length > 0 && featuredMantra ? (
          <GlassCard style={styles.featuredCard}>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredLabel}>FROM YOUR COLLECTION</Text>
              <Pressable
                onPress={shuffleFeatured}
                disabled={refreshing}
                hitSlop={12}
                style={styles.refreshButton}
              >
                <Svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="none"
                  style={refreshing ? { opacity: 0.4 } : undefined}
                >
                  <Path
                    d="M23 4v6h-6M1 20v-6h6"
                    stroke={Colors.teal}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
                    stroke={Colors.teal}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </Pressable>
            </View>
            <Text style={[styles.featuredText, refreshing && { opacity: 0.4 }]}>
              {featuredMantra.text}
            </Text>
            <View style={styles.featuredFooter}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{featuredMantra.category}</Text>
              </View>
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>{'✦'}</Text>
            <Text style={styles.emptyTitle}>Your library is empty</Text>
            <Text style={styles.emptyBody}>
              Tap the heart on any mantra to start building your personal collection.
            </Text>
          </GlassCard>
        )}

        {/* Master Mantra card */}
        {isPro && likedCount >= 5 && (
          <Pressable onPress={() => router.push('/master-mantra')}>
            <GlassCard style={styles.masterNudge} borderRadius={16} padding={16}>
              <View style={styles.masterNudgeContent}>
                <Text style={styles.masterNudgeTitle}>Your Master Mantra {'✦'}</Text>
                <Text style={styles.masterNudgeSub}>Synthesised from {likedCount} liked mantras</Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                <Path d="M9 18l6-6-6-6" stroke={Colors.teal} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </GlassCard>
          </Pressable>
        )}

        {/* Categories — only shows categories with liked mantras */}
        {categoriesWithLikes.length > 0 && (
          <>
            <Text style={styles.categoriesLabel}>YOUR CATEGORIES</Text>
            <View style={styles.chipGrid}>
              {categoriesWithLikes.map((cat) => (
                <Pressable
                  key={cat}
                  style={styles.categoryChip}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={styles.categoryChipName}>{cat}</Text>
                  <Text style={styles.categoryChipCount}>
                    {likedByCategory[cat].length} liked
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Category modal — shows only liked mantras in that category */}
      <ModalSheet
        visible={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{selectedCategory}</Text>
              <Text style={styles.modalCount}>
                {likedByCategory[selectedCategory ?? '']?.length ?? 0} liked mantras
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              hitSlop={16}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: Colors.mauve, fontSize: 18 }}>{'✕'}</Text>
            </Pressable>
          </View>
          {(likedByCategory[selectedCategory ?? ''] ?? []).map((mantra) => (
            <LikedMantraRow key={mantra.id} mantra={mantra} onToggle={fetchLiked} />
          ))}
        </View>
      </ModalSheet>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
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
  },
  likedCountBadge: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
    marginBottom: 4,
  },

  // Featured card
  featuredCard: {
    marginBottom: 16,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.sectionLabel,
    color: Colors.teal,
  },
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraGate,
    color: Colors.cream,
    lineHeight: FontSizes.mantraGate * 1.55,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(216,180,254,0.1)',
    borderRadius: Radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  categoryPillText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
  },

  // Empty state
  emptyCard: {
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 32,
    color: Colors.teal,
    opacity: 0.4,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    color: Colors.cream,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
    textAlign: 'center',
    lineHeight: FontSizes.bodySmall * LineHeights.relaxed,
  },

  // Master mantra nudge
  masterNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  masterNudgeContent: {
    flex: 1,
  },
  masterNudgeTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  masterNudgeSub: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
  },

  // Liked rows (used in modal too)
  likedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  likedContent: {
    flex: 1,
  },
  likedMantra: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraSmall,
    color: Colors.cream,
    lineHeight: FontSizes.mantraSmall * LineHeights.normal,
  },

  // Categories
  categoriesLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 12,
    marginTop: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryChipName: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.label,
    color: Colors.lavender,
  },
  categoryChipCount: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.4)',
  },

  // Category modal
  modalContent: {
    paddingHorizontal: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: 22,
    color: Colors.cream,
  },
  modalCount: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
  },
});
