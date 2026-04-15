import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import dayjs from 'dayjs';
import { useTheme } from '../../src/hooks/useTheme';
import { useTaskStore } from '../../src/store/useTaskStore';
import { useBiometricAuth } from '../../src/hooks/useBiometricAuth';
import { ContributionGraph } from '../../src/components/ContributionGraph';
import { TaskCard } from '../../src/components/TaskCard';
import { Card } from '../../src/components/Card';
import { ProgressBar } from '../../src/components/ProgressBar';
import { getTodayDate, formatDateLong } from '../../src/utils/helpers';
import { BorderRadius, FontSize, Spacing } from '../../src/constants/theme';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(getTodayDate());
  const { isUnlocked } = useBiometricAuth();

  const tasks = useTaskStore((s) => s.getTasksForDate(selected));
  const summary = useTaskStore((s) => s.getDailySummary(selected));

  const visibleTasks = useMemo(
    () => tasks.filter((t) => !t.isPrivate || isUnlocked),
    [tasks, isUnlocked],
  );

  const isPast = selected < getTodayDate();
  const isToday = selected === getTodayDate();
  const flexibleOnly = isPast
    ? visibleTasks.filter((t) => t.isFlexible)
    : visibleTasks;
  const lockedPastCount = isPast
    ? visibleTasks.filter((t) => !t.isFlexible).length
    : 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Takvim</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Son 20 haftanın genel görünümü
        </Text>

        <Card style={{ marginTop: Spacing.lg }}>
          <ContributionGraph
            selectedDate={selected}
            onSelectDate={setSelected}
          />
        </Card>

        {/* Seçili gün */}
        <View style={styles.selectedBlock}>
          <Text style={[styles.selectedDate, { color: colors.text }]}>
            {formatDateLong(selected)}
          </Text>
          {isToday ? (
            <View style={[styles.todayBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.todayText}>Bugün</Text>
            </View>
          ) : null}
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Tamamlanma
            </Text>
            <Text style={[styles.summaryPct, { color: colors.primary }]}>
              {Math.round(summary.completionRate * 100)}%
            </Text>
          </View>
          <ProgressBar progress={summary.completionRate} />
          <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
            {summary.completedTasks} / {summary.totalTasks} görev
          </Text>
        </Card>

        {flexibleOnly.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {isPast
                ? 'Geçmişe dönük işaretlenebilir görev yok'
                : 'Bu gün için görev yok'}
            </Text>
          </View>
        ) : (
          flexibleOnly.map((task) => (
            <TaskCard key={task.id} task={task} date={selected} />
          ))
        )}

        {lockedPastCount > 0 ? (
          <Text style={[styles.note, { color: colors.textMuted }]}>
            ℹ️ {lockedPastCount} görev esnek değil, geçmişte düzenlenemez.
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  title: { fontSize: FontSize.title, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  selectedBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  selectedDate: { fontSize: FontSize.lg, fontWeight: '700', textTransform: 'capitalize', flex: 1 },
  todayBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  todayText: { color: '#FFFFFF', fontWeight: '700', fontSize: FontSize.xs },
  summaryCard: { gap: Spacing.sm, marginBottom: Spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryPct: { fontSize: FontSize.xl, fontWeight: '800' },
  summaryDetail: { fontSize: FontSize.sm },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyTitle: { fontSize: FontSize.md, textAlign: 'center' },
  note: { fontSize: FontSize.sm, textAlign: 'center', marginTop: Spacing.lg },
});
