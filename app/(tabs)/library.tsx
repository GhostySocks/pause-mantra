import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, ModalSheet } from '@/components/ui';
import { HeartButton } from '@/components/HeartButton';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius, MANTRA_CATEGORIES } from '@/constants';
import { useAuthStore } from '@/lib/store';

type LibraryTab = 'Featured' | 'Liked' | 'Master';

// Placeholder data
const FEATURED_MANTRA = {
  id: '2',
  text: 'The universe is conspiring in my favour right now.',
  category: 'Manifestation',
};

const LIKED_MANTRAS = [
  { id: '3', text: 'I attract wealth and prosperity effortlessly.', category: 'Abundance' },
  { id: '4', text: 'I am enough, exactly as I am.', category: 'Self-Love' },
  { id: '5', text: 'My time and energy are sacred.', category: 'Focus' },
];

const CATEGORY_COUNTS: Record<string, number> = {
  Abundance: 680, 'Self-Love': 710, Confidence: 640, Health: 590, Gratitude: 720,
  Focus: 650, Connection: 570, Success: 690, Peace: 730, Creativity: 610,
  Vitality: 540, Courage: 580, Purpose: 660, Manifestation: 700, Clarity: 620,
};

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isPro } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LibraryTab>('Featured');
  const [featuredLiked, setFeaturedLiked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const likedCount = LIKED_MANTRAS.length;

  const tabs: LibraryTab[] = ['Featured', 'Liked', 'Master'];

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
            <Text style={styles.screenTitle}>Explore mantras</Text>
          </View>
          <Pressable style={styles.searchIcon}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke={Colors.mauve} strokeWidth={1.5} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Tab strip */}
        <View style={styles.tabStrip}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'Featured' && (
          <View style={styles.featuredCard}>
            <View style={styles.featuredHeader}>
              <Text style={styles.featuredLabel}>FEATURED</Text>
              <Pressable>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" stroke={Colors.teal} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </View>
            <Text style={styles.featuredMantra}>{FEATURED_MANTRA.text}</Text>
            <View style={styles.featuredFooter}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{FEATURED_MANTRA.category}</Text>
              </View>
              <HeartButton
                filled={featuredLiked}
                onPress={() => setFeaturedLiked(!featuredLiked)}
                size={20}
              />
            </View>
          </View>
        )}

        {activeTab === 'Liked' && (
          <View style={styles.likedCard}>
            <Text style={styles.likedLabel}>{likedCount} liked mantras</Text>
            {LIKED_MANTRAS.map((mantra) => (
              <View key={mantra.id} style={styles.likedRow}>
                <View style={styles.likedContent}>
                  <Text style={styles.likedMantra}>{mantra.text}</Text>
                  <Text style={styles.likedCategory}>{mantra.category}</Text>
                </View>
                <HeartButton filled onPress={() => {}} size={16} />
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Master' && (
          <View style={styles.masterCard}>
            {likedCount >= 5 ? (
              <>
                <Text style={styles.masterMantraText}>
                  I am abundant, present and deeply connected to my own power — moving through life with ease, intention and grace.
                </Text>
                <View style={styles.masterButtons}>
                  <Pressable style={styles.regenerateButton}>
                    <Text style={styles.regenerateText}>Regenerate</Text>
                  </Pressable>
                  <Pressable style={styles.setGateButton}>
                    <Text style={styles.setGateText}>Set as gate</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.masterLocked}>
                <Text style={{ fontSize: 28, opacity: 0.4 }}>{'♥'}</Text>
                <Text style={styles.masterLockedTitle}>Heart 5 mantras to unlock</Text>
                <Text style={styles.masterLockedBody}>
                  Your Master Mantra is synthesised from the mantras you love most.
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${(likedCount / 5) * 100}%` }]} />
                </View>
                <Text style={styles.progressCount}>{likedCount} / 5</Text>
              </View>
            )}
          </View>
        )}

        {/* Category chips */}
        <Text style={styles.categoriesLabel}>CATEGORIES</Text>
        <View style={styles.chipGrid}>
          {MANTRA_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={styles.categoryChip}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={styles.categoryChipName}>{cat}</Text>
              <Text style={styles.categoryChipCount}>
                {CATEGORY_COUNTS[cat] ?? 0} total
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Category modal */}
      <ModalSheet
        visible={selectedCategory !== null}
        onClose={() => setSelectedCategory(null)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>{selectedCategory}</Text>
              <Text style={styles.modalCount}>
                {CATEGORY_COUNTS[selectedCategory ?? ''] ?? 0} mantras
              </Text>
            </View>
            <Pressable onPress={() => setSelectedCategory(null)}>
              <Text style={{ color: Colors.mauve, fontSize: 18 }}>{'✕'}</Text>
            </Pressable>
          </View>
          {/* Placeholder mantra rows */}
          {['I attract wealth and prosperity effortlessly.', 'Money flows to me from multiple sources.', 'I am a magnet for abundance in all its forms.'].map((text, i) => (
            <View key={i} style={styles.modalMantraRow}>
              <Text style={styles.modalMantraText}>{text}</Text>
              <HeartButton filled={false} onPress={() => {}} size={18} />
            </View>
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
    alignItems: 'flex-start',
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
  searchIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.chipBg,
    borderRadius: Radius.pill,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  tabActive: {
    backgroundColor: Colors.teal,
  },
  tabText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: Colors.mauve,
  },
  tabTextActive: {
    fontFamily: Fonts.inter.medium,
    color: Colors.tealDark,
  },
  featuredCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.card,
    padding: 20,
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featuredLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.sectionLabel,
    color: Colors.teal,
  },
  featuredMantra: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraList,
    color: Colors.cream,
    lineHeight: FontSizes.mantraList * LineHeights.normal,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  likedCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.card,
    padding: 20,
    marginBottom: 24,
  },
  likedLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
    marginBottom: 16,
  },
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
  likedCategory: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.5)',
    marginTop: 2,
  },
  masterCard: {
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radius.card,
    padding: 20,
    marginBottom: 24,
  },
  masterMantraText: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: 18,
    color: Colors.cream,
    lineHeight: 18 * LineHeights.relaxed,
    marginBottom: 16,
  },
  masterButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  regenerateButton: {
    flex: 1,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(126,200,192,0.3)',
    backgroundColor: 'rgba(126,200,192,0.15)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  regenerateText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.teal,
  },
  setGateButton: {
    flex: 1,
    borderRadius: Radius.pill,
    backgroundColor: Colors.teal,
    paddingVertical: 12,
    alignItems: 'center',
  },
  setGateText: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.tealDark,
  },
  masterLocked: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  masterLockedTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
    marginTop: 8,
  },
  masterLockedBody: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.teal,
    borderRadius: Radius.pill,
  },
  progressCount: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.5)',
    marginTop: 6,
  },
  categoriesLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 12,
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
  modalMantraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  modalMantraText: {
    flex: 1,
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.categoryModal,
    color: Colors.cream,
    lineHeight: FontSizes.categoryModal * LineHeights.normal,
  },
});
