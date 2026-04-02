import { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, PillButton, ModalSheet } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';

// Placeholder data
const STATS = { current: 12, best: 24, total: 183 };

const RECENT_GATES = [
  { id: '1', app: 'Instagram', mantra: 'I am enough, exactly as I am.', outcome: 'entered' as const, time: '9:14 am', note: "I'm ready, grateful today." },
  { id: '2', app: 'TikTok', mantra: 'My time and energy are sacred.', outcome: 'closed' as const, time: '11:02 am' },
  { id: '3', app: 'Instagram', mantra: 'Abundance flows to me naturally.', outcome: 'entered' as const, time: '1:37 pm' },
  { id: '4', app: 'TikTok', mantra: 'I choose presence over distraction.', outcome: 'closed' as const, time: '3:51 pm' },
];

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

// Simulated gate counts per day
const GATE_COUNTS: Record<number, number> = {
  1: 3, 2: 6, 3: 2, 5: 4, 6: 7, 7: 1, 8: 5, 9: 3, 10: 8,
  11: 2, 12: 4, 13: 6, 14: 3, 15: 5, 17: 2, 18: 7, 19: 4,
  20: 3, 21: 6, 22: 1, 24: 5, 25: 3, 26: 8, 27: 4, 28: 2,
};

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const today = now.getDate();
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <GradientBackground>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 52 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenLabel}>JOURNAL</Text>
        <Text style={styles.screenTitle}>Your practice</Text>

        {/* Streak stats */}
        <View style={styles.statRow}>
          {[
            { label: 'CURRENT', value: STATS.current, unit: 'day streak' },
            { label: 'BEST', value: STATS.best, unit: 'day streak' },
            { label: 'TOTAL', value: STATS.total, unit: 'gates' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statTile}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
            </View>
          ))}
        </View>

        {/* Calendar heatmap */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
              else setViewMonth(viewMonth - 1);
            }}>
              <Text style={styles.calendarNav}>{'\u2039'}</Text>
            </Pressable>
            <Text style={styles.calendarMonth}>{monthLabel}</Text>
            <Pressable onPress={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
              else setViewMonth(viewMonth + 1);
            }}>
              <Text style={styles.calendarNav}>{'\u203A'}</Text>
            </Pressable>
          </View>

          <View style={styles.calendarGrid}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text key={i} style={styles.dayLabel}>{d}</Text>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <View key={`empty-${i}`} style={styles.calendarCell} />;
              const count = GATE_COUNTS[day] ?? 0;
              const isToday = isCurrentMonth && day === today;
              const isHigh = count >= 5;
              const isActive = count > 0 && count < 5;

              return (
                <View
                  key={day}
                  style={[
                    styles.calendarCell,
                    isHigh && styles.cellHigh,
                    isActive && styles.cellActive,
                    !isHigh && !isActive && styles.cellEmpty,
                    isToday && styles.cellToday,
                  ]}
                >
                  <Text style={[
                    styles.cellText,
                    isHigh && styles.cellTextHigh,
                    isActive && styles.cellTextActive,
                    !isHigh && !isActive && styles.cellTextEmpty,
                  ]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Gate log */}
        <Text style={styles.recentLabel}>RECENT GATES</Text>
        {RECENT_GATES.map((gate) => (
          <View key={gate.id} style={styles.gateRow}>
            <View style={styles.gateContent}>
              <View style={styles.gateHeader}>
                <Text style={styles.gateName}>{gate.app}</Text>
                <View style={[styles.statusPill, { backgroundColor: gate.outcome === 'entered' ? Colors.statusEntered : Colors.statusClosed }]}>
                  <Text style={styles.statusText}>{gate.outcome}</Text>
                </View>
              </View>
              <Text style={styles.gateMantra}>{gate.mantra}</Text>
              {gate.note && (
                <Text style={styles.gateNote}>{gate.note}</Text>
              )}
              <Text style={styles.gateTime}>{gate.time}</Text>
            </View>
            <Pressable onPress={() => { setNoteModal(gate.id); setNoteText(gate.note ?? ''); }}>
              <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
                <Path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="rgba(196,168,224,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Note modal */}
      <ModalSheet
        visible={noteModal !== null}
        onClose={() => setNoteModal(null)}
      >
        <View style={styles.noteModalContent}>
          <View style={styles.noteModalHeader}>
            <Text style={styles.noteModalTitle}>
              {RECENT_GATES.find((g) => g.id === noteModal)?.app ?? ''} {'\u00b7'} {RECENT_GATES.find((g) => g.id === noteModal)?.time ?? ''}
            </Text>
            <Pressable onPress={() => setNoteModal(null)}>
              <Text style={{ color: Colors.mauve, fontSize: 18 }}>{'\u2715'}</Text>
            </Pressable>
          </View>
          <Text style={styles.notePrompt}>A thought before you go...</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="How did that feel?"
            placeholderTextColor="rgba(196,168,224,0.4)"
            value={noteText}
            onChangeText={setNoteText}
            multiline
          />
          <PillButton
            label="Save reflection"
            onPress={() => setNoteModal(null)}
            textStyle={{ fontSize: 14 }}
          />
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
  statRow: {
    flexDirection: 'row',
    gap: Spacing.tileGap,
    marginBottom: 16,
  },
  statTile: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.12)',
    borderRadius: Radius.tile,
    padding: 14,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 2,
  },
  statNumber: {
    fontFamily: Fonts.cormorant.medium,
    fontSize: FontSizes.statNumber,
    color: Colors.cream,
  },
  statUnit: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: Colors.mauve,
  },
  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.12)',
    borderRadius: Radius.tile,
    padding: 16,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonth: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  calendarNav: {
    fontSize: 20,
    color: Colors.mauve,
    paddingHorizontal: 12,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayLabel: {
    width: '13.28%',
    textAlign: 'center',
    fontFamily: Fonts.inter.regular,
    fontSize: 9,
    color: 'rgba(196,168,224,0.5)',
    marginBottom: 4,
  },
  calendarCell: {
    width: '13.28%',
    height: 28,
    borderRadius: Radius.calendar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmpty: {
    backgroundColor: Colors.calendarEmpty,
  },
  cellActive: {
    backgroundColor: Colors.calendarActive,
  },
  cellHigh: {
    backgroundColor: Colors.calendarHigh,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: Colors.teal,
  },
  cellText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
  },
  cellTextEmpty: { color: Colors.calendarEmptyText },
  cellTextActive: { color: Colors.calendarActiveText },
  cellTextHigh: { color: Colors.calendarHighText },
  recentLabel: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    letterSpacing: LetterSpacing.statLabel,
    color: Colors.mauve,
    marginBottom: 12,
  },
  gateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  gateContent: {
    flex: 1,
  },
  gateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  gateName: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  statusPill: {
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  statusText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: Colors.tealDark,
  },
  gateMantra: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraXSmall,
    color: Colors.mauve,
    marginBottom: 2,
  },
  gateNote: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.label,
    color: 'rgba(126,200,192,0.7)',
    marginBottom: 2,
  },
  gateTime: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.4)',
  },
  noteModalContent: {
    paddingHorizontal: 24,
  },
  noteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteModalTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.bodySmall,
    color: Colors.cream,
  },
  notePrompt: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.mauve,
    marginBottom: 12,
  },
  noteInput: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.buttonLarge,
    color: Colors.cream,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(216,180,254,0.2)',
    borderRadius: Radius.input,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
});
