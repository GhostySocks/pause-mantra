import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable, Share, Animated, StyleSheet, ScrollView, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, PulseRings } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, Spacing, Radius } from '@/constants';
import { useAuthStore, useSettingsStore } from '@/lib/store';

const PLACEHOLDER_MASTER = 'I am abundant, present and deeply connected to my own power, moving through life with ease, intention and grace.';

const HISTORY = [
  { text: 'I attract what I need and release what no longer serves me.', date: '2 weeks ago', likes: 28 },
  { text: 'I am worthy of everything beautiful that is coming my way.', date: '4 weeks ago', likes: 19 },
];

function GeneratingDot({ delay }: { delay: number }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.2, duration: 600, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 1, duration: 600, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.8, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.generatingDot, { transform: [{ scale }], opacity }]} />;
}

function FadeInWord({ word, delay }: { word: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, delay, easing: Easing.ease, useNativeDriver: true }).start();
  }, []);
  return <Animated.Text style={{ opacity }}>{word} </Animated.Text>;
}

export default function MasterMantraScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPro } = useAuthStore();
  const { masterMantraActive, setMasterMantraActive } = useSettingsStore();
  const [mantraText] = useState(PLACEHOLDER_MASTER);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealedWords, setRevealedWords] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const historyOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPro) router.replace('/(tabs)');
  }, [isPro]);

  useEffect(() => {
    Animated.timing(historyOpacity, { toValue: showHistory ? 1 : 0, duration: 300, useNativeDriver: true }).start();
  }, [showHistory]);

  const handleRegenerate = useCallback(() => {
    setIsGenerating(true);
    setRevealedWords([]);
    setTimeout(() => {
      setIsGenerating(false);
      const words = mantraText.split(' ');
      words.forEach((word, i) => {
        setTimeout(() => setRevealedWords((prev) => [...prev, word]), i * 180);
      });
    }, 2200);
  }, [mantraText]);

  const handleShare = useCallback(async () => {
    try { await Share.share({ message: mantraText }); } catch {}
  }, [mantraText]);

  return (
    <GradientBackground>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenLabel}>MASTER MANTRA</Text>
            <Text style={styles.subLabel}>Synthesised from 34 likes</Text>
          </View>
          <Pressable onPress={handleRegenerate} disabled={isGenerating} style={[styles.regenerateButton, isGenerating && { opacity: 0.4 }]}>
            <Text style={styles.regenerateText}>Regenerate</Text>
          </Pressable>
        </View>

        <View style={styles.mantraArea}>
          <PulseRings outerSize={240} innerSize={190} outerColor="rgba(126,200,192,0.25)" innerColor="rgba(126,200,192,0.15)" duration={6000} innerDelay={1000} />
          {isGenerating ? (
            <View style={styles.generatingState}>
              <View style={styles.dotsRow}>
                {[0, 1, 2].map((i) => <GeneratingDot key={i} delay={i * 200} />)}
              </View>
              <Text style={styles.generatingLabel}>SYNTHESISING YOUR WORDS</Text>
            </View>
          ) : revealedWords.length > 0 ? (
            <Text style={styles.mantraText}>
              {revealedWords.map((word, i) => <FadeInWord key={i} word={word} delay={0} />)}
            </Text>
          ) : (
            <Text style={styles.mantraText}>{mantraText}</Text>
          )}
        </View>

        <View style={styles.actionRow}>
          <Pressable onPress={() => setMasterMantraActive(!masterMantraActive, 'master-1')} style={[styles.setGateButton, masterMantraActive && styles.setGateButtonActive]}>
            <Text style={[styles.setGateText, masterMantraActive && styles.setGateTextActive]}>
              {masterMantraActive ? 'Active as gate mantra ✓' : 'Set as gate mantra'}
            </Text>
          </Pressable>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke={Colors.mauve} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>

        <Pressable onPress={() => setShowHistory(!showHistory)} style={styles.historyToggle}>
          <Text style={styles.historyLabel}>PREVIOUS VERSIONS</Text>
          <Text style={[styles.historyChevron, showHistory && { transform: [{ rotate: '180deg' }] }]}>{'⌄'}</Text>
        </Pressable>

        {showHistory && (
          <Animated.View style={[styles.historyList, { opacity: historyOpacity }]}>
            {HISTORY.map((item, i) => (
              <View key={i} style={styles.historyItem}>
                <Text style={styles.historyMantra}>{item.text}</Text>
                <Text style={styles.historyMeta}>{item.date} {'·'} {item.likes} likes</Text>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, marginBottom: 40 },
  screenLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, letterSpacing: LetterSpacing.eyebrow, color: Colors.teal, marginBottom: 2 },
  subLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, color: 'rgba(196,168,224,0.5)' },
  regenerateButton: { backgroundColor: 'rgba(126,200,192,0.1)', borderWidth: 1, borderColor: 'rgba(126,200,192,0.25)', borderRadius: Radius.pill, paddingVertical: 7, paddingHorizontal: 14 },
  regenerateText: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.caption, color: Colors.teal },
  mantraArea: { alignItems: 'center', justifyContent: 'center', minHeight: 300, paddingHorizontal: 32 },
  mantraText: { fontFamily: Fonts.cormorant.italic, fontSize: FontSizes.masterMantra, color: Colors.cream, textAlign: 'center', lineHeight: FontSizes.masterMantra * 1.6, zIndex: 1 },
  generatingState: { alignItems: 'center', zIndex: 1 },
  dotsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  generatingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.teal },
  generatingLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.label, letterSpacing: 1, color: 'rgba(196,168,224,0.6)', textTransform: 'uppercase' },
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 24, marginBottom: 20, marginTop: 40 },
  setGateButton: { flex: 1, borderRadius: Radius.pill, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.teal },
  setGateButtonActive: { backgroundColor: 'rgba(126,200,192,0.15)', borderWidth: 1, borderColor: 'rgba(126,200,192,0.3)' },
  setGateText: { fontFamily: Fonts.inter.medium, fontSize: FontSizes.bodySmall, color: Colors.tealDark },
  setGateTextActive: { color: Colors.teal },
  shareButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  historyToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  historyLabel: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.micro, letterSpacing: 2, color: 'rgba(196,168,224,0.4)' },
  historyChevron: { fontSize: 12, color: 'rgba(196,168,224,0.4)' },
  historyList: { paddingHorizontal: 24, gap: 2 },
  historyItem: { padding: 12, paddingHorizontal: 14, borderRadius: Radius.input, backgroundColor: 'rgba(255,255,255,0.03)' },
  historyMantra: { fontFamily: Fonts.cormorant.italic, fontSize: FontSizes.mantraSmall, color: 'rgba(196,168,224,0.6)', lineHeight: FontSizes.mantraSmall * 1.55 },
  historyMeta: { fontFamily: Fonts.inter.regular, fontSize: FontSizes.micro, color: 'rgba(196,168,224,0.3)', marginTop: 6 },
});
