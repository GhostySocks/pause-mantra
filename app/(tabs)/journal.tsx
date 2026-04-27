import { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GradientBackground, GlassCard, PillButton, ModalSheet } from '@/components/ui';
import { Colors, Fonts, FontSizes, LetterSpacing, LineHeights, Spacing, Radius } from '@/constants';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useGateStats } from '@/hooks/useGate';

type GateRow = {
  id: string;
  app_name: string;
  mantra_id: string | null;
  outcome: 'entered' | 'closed';
  created_at: string;
  mantra_text?: string;
  note?: string;
};

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  return days;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useAuthStore();
  const { streak, todayCount } = useGateStats();
  const [noteModal, setNoteModal] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [recentGates, setRecentGates] = useState<GateRow[]>([]);
  const [calendarCounts, setCalendarCounts] = useState<Record<number, number>>({});
  const [dayGates, setDayGates] = useState<GateRow[]>([]);
  const [totalGates, setTotalGates] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const calendarDays = getCalendarDays(viewYear, viewMonth);
  const today = now.getDate();
  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
  const monthLabel = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  // Fetch recent gates
  const fetchRecentGates = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('gate_events')
      .select('id, app_name, mantra_id, outcome, created_at, mantras(text)')
      .eq('user_id', userId)
      .neq('app_name', 'app_open')
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) {
      const rows: GateRow[] = data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        app_name: row.app_name as string,
        mantra_id: row.mantra_id as string | null,
        outcome: row.outcome as 'entered' | 'closed',
        created_at: row.created_at as string,
        mantra_text: (row.mantras as Record<string, string> | null)?.text,
      }));

      // Fetch notes for these gates
      const gateIds = rows.map((r) => r.id);
      if (gateIds.length > 0) {
        const { data: notes } = await supabase
          .from('gate_notes')
          .select('gate_event_id, note_text')
          .in('gate_event_id', gateIds);

        if (notes) {
          const noteMap = new Map(notes.map((n: Record<string, string>) => [n.gate_event_id, n.note_text]));
          for (const row of rows) {
            row.note = noteMap.get(row.id);
          }
        }
      }

      setRecentGates(rows);
    }
  }, [userId]);

  // Fetch calendar data for the viewed month
  const fetchCalendar = useCallback(async () => {
    if (!userId) return;
    const monthStart = new Date(viewYear, viewMonth, 1).toISOString();
    const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('gate_events')
      .select('created_at')
      .eq('user_id', userId)
      .eq('outcome', 'entered')
      .neq('app_name', 'app_open')
      .gte('created_at', monthStart)
      .lte('created_at', monthEnd);

    if (data) {
      const counts: Record<number, number> = {};
      for (const e of data) {
        const day = new Date(e.created_at).getDate();
        counts[day] = (counts[day] ?? 0) + 1;
      }
      setCalendarCounts(counts);
    }
  }, [userId, viewMonth, viewYear]);

  // Fetch total gates and best streak
  const fetchStats = useCallback(async () => {
    if (!userId) return;
    const { count } = await supabase
      .from('gate_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('outcome', 'entered')
      .neq('app_name', 'app_open');
    setTotalGates(count ?? 0);

    // Best streak — includes app_open (opening the app keeps streak alive)
    const { data: events } = await supabase
      .from('gate_events')
      .select('created_at')
      .eq('user_id', userId)
      .eq('outcome', 'entered')
      .order('created_at', { ascending: true });

    if (events && events.length > 0) {
      const days = new Set<string>();
      for (const e of events) {
        days.add(new Date(e.created_at).toISOString().split('T')[0]);
      }
      const sortedDays = [...days].sort();
      let best = 1;
      let current = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const curr = new Date(sortedDays[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          current++;
          if (current > best) best = current;
        } else {
          current = 1;
        }
      }
      setBestStreak(best);
    }
  }, [userId]);

  useEffect(() => {
    fetchRecentGates();
    fetchStats();
  }, [fetchRecentGates, fetchStats]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  // Fetch gates for a specific day (modal)
  const fetchDayGates = useCallback(async (day: number) => {
    if (!userId) return;
    const dayStart = new Date(viewYear, viewMonth, day).toISOString();
    const dayEnd = new Date(viewYear, viewMonth, day, 23, 59, 59).toISOString();

    const { data } = await supabase
      .from('gate_events')
      .select('id, app_name, mantra_id, outcome, created_at, mantras(text)')
      .eq('user_id', userId)
      .neq('app_name', 'app_open')
      .gte('created_at', dayStart)
      .lte('created_at', dayEnd)
      .order('created_at', { ascending: true });

    if (data) {
      setDayGates(data.map((row: Record<string, unknown>) => ({
        id: row.id as string,
        app_name: row.app_name as string,
        mantra_id: row.mantra_id as string | null,
        outcome: row.outcome as 'entered' | 'closed',
        created_at: row.created_at as string,
        mantra_text: (row.mantras as Record<string, string> | null)?.text,
      })));
    }
    setSelectedDay(day);
  }, [userId, viewMonth, viewYear]);

  // Save reflection note
  const handleSaveNote = useCallback(async () => {
    if (!noteModal || !noteText.trim() || !userId) {
      setNoteModal(null);
      return;
    }

    await supabase
      .from('gate_notes')
      .upsert({
        user_id: userId,
        gate_event_id: noteModal,
        note_text: noteText.trim(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'gate_event_id' });

    setNoteModal(null);
    fetchRecentGates();
  }, [noteModal, noteText, userId, fetchRecentGates]);

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
            { label: 'CURRENT', value: streak, unit: 'day streak' },
            { label: 'BEST', value: bestStreak, unit: 'day streak' },
            { label: 'TOTAL', value: totalGates, unit: 'gates' },
          ].map((stat) => (
            <GlassCard key={stat.label} style={styles.statTile} borderRadius={16} padding={16}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statUnit}>{stat.unit}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Calendar heatmap */}
        <GlassCard style={styles.calendarCard} borderRadius={16} padding={16}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={() => {
              if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
              else setViewMonth(viewMonth - 1);
            }}>
              <Text style={styles.calendarNav}>{'‹'}</Text>
            </Pressable>
            <Text style={styles.calendarMonth}>{monthLabel}</Text>
            <Pressable onPress={() => {
              if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
              else setViewMonth(viewMonth + 1);
            }}>
              <Text style={styles.calendarNav}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={styles.calendarGrid}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text key={i} style={styles.dayLabel}>{d}</Text>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <View key={`empty-${i}`} style={styles.calendarCell} />;
              const count = calendarCounts[day] ?? 0;
              const isToday = isCurrentMonth && day === today;
              const isHigh = count >= 5;
              const isActive = count > 0 && count < 5;

              return (
                <Pressable
                  key={day}
                  style={styles.calendarCell}
                  onPress={() => count > 0 ? fetchDayGates(day) : null}
                >
                  <View
                    style={[
                      styles.cellInner,
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
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        {/* Gate log */}
        <Text style={styles.recentLabel}>RECENT GATES</Text>
        <Text style={styles.recentHint}>Tap any gate to add a reflection</Text>
        {recentGates.length > 0 ? recentGates.map((gate) => (
          <Pressable key={gate.id} style={styles.gateRow} onPress={() => { setNoteModal(gate.id); setNoteText(gate.note ?? ''); }}>
            <View style={styles.gateContent}>
              <View style={styles.gateHeader}>
                <Text style={styles.gateName}>{gate.app_name}</Text>
                <View style={[styles.statusPill, { backgroundColor: gate.outcome === 'entered' ? Colors.statusEntered : Colors.statusClosed }]}>
                  <Text style={styles.statusText}>{gate.outcome}</Text>
                </View>
              </View>
              {gate.mantra_text && <Text style={styles.gateMantra}>{gate.mantra_text}</Text>}
              {gate.note && (
                <Text style={styles.gateNote}>{gate.note}</Text>
              )}
              <Text style={styles.gateTime}>{formatTime(gate.created_at)}</Text>
            </View>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" stroke="rgba(196,168,224,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M16 8L2 22M17.5 15H9" stroke="rgba(196,168,224,0.4)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )) : (
          <Text style={styles.dayNoData}>No gates yet. Your practice log will appear here.</Text>
        )}
      </ScrollView>

      {/* Day detail modal */}
      <ModalSheet
        visible={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
      >
        <View style={styles.dayModalContent}>
          <View style={styles.dayModalHeader}>
            <View>
              <Text style={styles.dayModalTitle}>
                {selectedDay !== null
                  ? new Date(viewYear, viewMonth, selectedDay).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })
                  : ''}
              </Text>
              <Text style={styles.dayModalCount}>
                {calendarCounts[selectedDay ?? 0] ?? 0} gates
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedDay(null)}
              hitSlop={16}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: Colors.mauve, fontSize: 18 }}>{'✕'}</Text>
            </Pressable>
          </View>
          {dayGates.map((gate) => (
            <View key={gate.id} style={styles.dayGateRow}>
              <View style={styles.dayGateContent}>
                <View style={styles.dayGateHeader}>
                  <Text style={styles.dayGateName}>{gate.app_name}</Text>
                  <View style={[styles.dayStatusPill, { backgroundColor: gate.outcome === 'entered' ? Colors.statusEntered : Colors.statusClosed }]}>
                    <Text style={styles.dayStatusText}>{gate.outcome}</Text>
                  </View>
                </View>
                {gate.mantra_text && <Text style={styles.dayGateMantra}>{gate.mantra_text}</Text>}
                <Text style={styles.dayGateTime}>{formatTime(gate.created_at)}</Text>
              </View>
            </View>
          ))}
          {dayGates.length === 0 && (
            <Text style={styles.dayNoData}>No gate events for this day.</Text>
          )}
        </View>
      </ModalSheet>

      {/* Note modal */}
      <ModalSheet
        visible={noteModal !== null}
        onClose={() => setNoteModal(null)}
      >
        <View style={styles.noteModalContent}>
          <View style={styles.noteModalHeader}>
            <Text style={styles.noteModalTitle}>
              {recentGates.find((g) => g.id === noteModal)?.app_name ?? ''} {'·'} {noteModal ? formatTime(recentGates.find((g) => g.id === noteModal)?.created_at ?? '') : ''}
            </Text>
            <Pressable
              onPress={() => setNoteModal(null)}
              hitSlop={16}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ color: Colors.mauve, fontSize: 18 }}>{'✕'}</Text>
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
            onPress={handleSaveNote}
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
  },
  dayLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontFamily: Fonts.inter.regular,
    fontSize: 9,
    color: 'rgba(196,168,224,0.5)',
    marginBottom: 4,
  },
  calendarCell: {
    width: '14.28%',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  cellInner: {
    width: '100%',
    height: '100%',
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
    marginBottom: 4,
  },
  recentHint: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: 'rgba(196,168,224,0.6)',
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
    color: 'rgba(196,168,224,0.6)',
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
  dayModalContent: {
    paddingHorizontal: 24,
  },
  dayModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayModalTitle: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.buttonLarge,
    color: Colors.cream,
  },
  dayModalCount: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.caption,
    color: Colors.teal,
    marginTop: 2,
  },
  dayGateRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  dayGateContent: {},
  dayGateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dayGateName: {
    fontFamily: Fonts.inter.medium,
    fontSize: FontSizes.label,
    color: Colors.cream,
  },
  dayStatusPill: {
    borderRadius: Radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dayStatusText: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: Colors.tealDark,
  },
  dayGateMantra: {
    fontFamily: Fonts.cormorant.italic,
    fontSize: FontSizes.mantraXSmall,
    color: Colors.mauve,
    marginBottom: 2,
  },
  dayGateTime: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.micro,
    color: 'rgba(196,168,224,0.6)',
  },
  dayNoData: {
    fontFamily: Fonts.inter.regular,
    fontSize: FontSizes.bodySmall,
    color: 'rgba(196,168,224,0.5)',
    textAlign: 'center',
    paddingVertical: 24,
  },
});
