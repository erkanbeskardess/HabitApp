import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useTaskStore } from '../../src/store/useTaskStore';
import { useBiometricAuth } from '../../src/hooks/useBiometricAuth';
import { TaskCard } from '../../src/components/TaskCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Card } from '../../src/components/Card';
import {
  getTodayDate,
  formatDateLong,
} from '../../src/utils/helpers';
import { BorderRadius, FontSize, Spacing } from '../../src/constants/theme';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const today = getTodayDate();

  const tasks = useTaskStore((s) => s.getTasksForDate(today));
  const summary = useTaskStore((s) => s.getDailySummary(today));
  const quotes = useTaskStore((s) => s.quotes);
  const showQuotes = useTaskStore((s) => s.settings.showQuotes);

  const { authenticate, lock, isUnlocked } = useBiometricAuth();
  const [refreshing, setRefreshing] = useState(false);

  const todayQuote = useMemo(() => {
    if (!quotes.length) return null;
    const dayIndex = parseInt(today.replaceAll('-', ''), 10);
    return quotes[dayIndex % quotes.length];
  }, [quotes, today]);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => !t.isPrivate || isUnlocked),
    [tasks, isUnlocked],
  );

  const hiddenCount = tasks.filter((t) => t.isPrivate).length;
  const pct = Math.round(summary.completionRate * 100);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Başlık */}
        <View style={styles.headerBlock}>
          <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
            {formatDateLong(today)}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>Bugün</Text>
        </View>

        {/* Motivasyon sözü */}
        {showQuotes && todayQuote ? (
          <Card style={{ ...styles.quoteCard, borderColor: colors.primary }}>
            <Text style={[styles.quoteText, { color: colors.text }]}>
              "{todayQuote.text}"
            </Text>
            {todayQuote.author ? (
              <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
                — {todayQuote.author}
              </Text>
            ) : null}
          </Card>
        ) : null}

        {/* Günün özeti */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Günün İlerlemesi
            </Text>
            <Text style={[styles.summaryPct, { color: colors.primary }]}>
              {pct}%
            </Text>
          </View>
          <ProgressBar progress={summary.completionRate} height={10} />
          <Text style={[styles.summaryDetail, { color: colors.textSecondary }]}>
            {summary.completedTasks} / {summary.totalTasks} görev tamamlandı
          </Text>
        </Card>

        {/* Gizli kilit açma */}
        {hiddenCount > 0 ? (
          <Pressable
            onPress={isUnlocked ? lock : authenticate}
            style={[
              styles.lockBar,
              {
                backgroundColor: colors.card,
                borderColor: isUnlocked ? colors.success : colors.border,
              },
            ]}
          >
            <Text style={{ fontSize: 18 }}>{isUnlocked ? '🔓' : '🔒'}</Text>
            <Text style={[styles.lockText, { color: colors.text }]}>
              {isUnlocked
                ? 'Gizli rutinler görünür (dokun, kilitle)'
                : `Gizli rutinleri göster (${hiddenCount})`}
            </Text>
          </Pressable>
        ) : null}

        {/* Görev listesi */}
        {visibleTasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌱</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Henüz görev yok
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              İlk alışkanlığını oluşturmak için aşağıdaki + butonuna dokun.
            </Text>
          </View>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              date={today}
              onLongPress={(t) =>
                router.push({ pathname: '/task-form', params: { taskId: t.id } })
              }
            />
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => router.push('/task-form')}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  headerBlock: { marginBottom: Spacing.lg },
  dateLabel: { fontSize: FontSize.sm, textTransform: 'capitalize' },
  title: { fontSize: FontSize.title, fontWeight: '800', marginTop: Spacing.xs },
  quoteCard: {
    marginBottom: Spacing.lg,
    borderLeftWidth: 3,
  },
  quoteText: { fontSize: FontSize.md, fontStyle: 'italic', lineHeight: 22 },
  quoteAuthor: { fontSize: FontSize.sm, marginTop: Spacing.sm, textAlign: 'right' },
  summaryCard: { marginBottom: Spacing.lg, gap: Spacing.md },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryPct: { fontSize: FontSize.xxl, fontWeight: '800' },
  summaryDetail: { fontSize: FontSize.sm },
  lockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  lockText: { fontSize: FontSize.sm, fontWeight: '600', flex: 1 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl * 2 },
  emptyEmoji: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSize.md, textAlign: 'center', paddingHorizontal: Spacing.xl },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 32, fontWeight: '300', lineHeight: 34 },
});
