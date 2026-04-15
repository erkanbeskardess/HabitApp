import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import dayjs from 'dayjs';
import { useTheme } from '../../src/hooks/useTheme';
import { useTaskStore } from '../../src/store/useTaskStore';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { getLastNDays } from '../../src/utils/helpers';
import { BorderRadius, FontSize, Spacing } from '../../src/constants/theme';

const SCREEN_W = Dimensions.get('window').width;

export default function ProfileScreen() {
  const { colors, mode } = useTheme();
  const settings = useTaskStore((s) => s.settings);
  const updateSettings = useTaskStore((s) => s.updateSettings);
  const tasks = useTaskStore((s) => s.tasks);
  const quotes = useTaskStore((s) => s.quotes);
  const addQuote = useTaskStore((s) => s.addQuote);
  const toggleFavorite = useTaskStore((s) => s.toggleFavoriteQuote);
  const removeQuote = useTaskStore((s) => s.removeQuote);
  const getDailySummary = useTaskStore((s) => s.getDailySummary);
  const getStreak = useTaskStore((s) => s.getStreak);

  const [range, setRange] = useState<'week' | 'month'>('week');
  const [newQuote, setNewQuote] = useState('');

  const days = range === 'week' ? 7 : 30;
  const dateList = useMemo(() => getLastNDays(days), [days]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    dateList.forEach((d, i) => {
      const summary = getDailySummary(d);
      const pct = Math.round(summary.completionRate * 100);
      data.push(pct);
      if (range === 'week') {
        labels.push(dayjs(d).locale('tr').format('dd'));
      } else {
        labels.push(i % 5 === 0 ? dayjs(d).format('DD') : '');
      }
    });
    return { labels, datasets: [{ data }] };
  }, [dateList, range, getDailySummary]);

  const overallStats = useMemo(() => {
    const activeTasks = tasks.filter((t) => t.isActive);
    let bestStreak = 0;
    let bestStreakTask = '';
    activeTasks.forEach((t) => {
      const s = getStreak(t.id);
      if (s.currentStreak > bestStreak) {
        bestStreak = s.currentStreak;
        bestStreakTask = t.title;
      }
    });
    const avg =
      dateList.reduce((acc, d) => acc + getDailySummary(d).completionRate, 0) /
      dateList.length;
    return {
      totalTasks: activeTasks.length,
      avgCompletion: Math.round(avg * 100),
      bestStreak,
      bestStreakTask,
    };
  }, [tasks, dateList, getStreak, getDailySummary]);

  const favorites = quotes.filter((q) => q.isFavorite);

  const handleAddQuote = () => {
    if (!newQuote.trim()) return;
    addQuote({ text: newQuote.trim(), isFavorite: true });
    setNewQuote('');
  };

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) =>
      mode === 'dark'
        ? `rgba(124, 92, 252, ${opacity})`
        : `rgba(108, 71, 255, ${opacity})`,
    labelColor: () => colors.textSecondary,
    barPercentage: 0.6,
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Profil</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Başarı ve ayarların
        </Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox
            label="Aktif Görev"
            value={overallStats.totalTasks.toString()}
            icon="🎯"
          />
          <StatBox
            label="Ortalama"
            value={`%${overallStats.avgCompletion}`}
            icon="📈"
          />
          <StatBox
            label="En Uzun"
            value={`${overallStats.bestStreak}🔥`}
            icon=""
          />
        </View>

        {/* Range toggle */}
        <View style={styles.segment}>
          <SegBtn
            label="Haftalık"
            active={range === 'week'}
            onPress={() => setRange('week')}
          />
          <SegBtn
            label="Aylık"
            active={range === 'month'}
            onPress={() => setRange('month')}
          />
        </View>

        {/* Chart */}
        <Card style={{ paddingVertical: Spacing.md }}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Tamamlanma Oranı (%)
          </Text>
          <BarChart
            data={chartData}
            width={SCREEN_W - Spacing.lg * 2 - Spacing.lg * 2}
            height={200}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars={range === 'week'}
            style={{ marginLeft: -Spacing.md, marginTop: Spacing.sm }}
          />
        </Card>

        {/* Ayarlar */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>Ayarlar</Text>

        <SettingsRow
          label="🎨 Tema"
          value={
            settings.themeMode === 'dark'
              ? 'Karanlık'
              : settings.themeMode === 'light'
                ? 'Aydınlık'
                : 'Sistem'
          }
          onPress={() => {
            const next =
              settings.themeMode === 'dark'
                ? 'light'
                : settings.themeMode === 'light'
                  ? 'system'
                  : 'dark';
            updateSettings({ themeMode: next });
          }}
        />
        <SettingsRow
          label="💬 Günlük Motivasyon"
          value={settings.showQuotes ? 'Açık' : 'Kapalı'}
          onPress={() => updateSettings({ showQuotes: !settings.showQuotes })}
        />

        {/* Favori Sözler */}
        <Text style={[styles.section, { color: colors.textSecondary }]}>
          ⭐ Favori Sözler ({favorites.length})
        </Text>

        <Card style={styles.addQuoteCard}>
          <TextInput
            value={newQuote}
            onChangeText={setNewQuote}
            placeholder="Yeni bir motivasyon sözü ekle..."
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.quoteInput, { color: colors.text }]}
          />
          <Button title="Ekle" onPress={handleAddQuote} icon="＋" />
        </Card>

        {quotes.map((q) => (
          <Card key={q.id} style={styles.quoteItem}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quoteText, { color: colors.text }]}>
                "{q.text}"
              </Text>
              {q.author ? (
                <Text style={[styles.quoteAuthor, { color: colors.textSecondary }]}>
                  — {q.author}
                </Text>
              ) : null}
            </View>
            <View style={styles.quoteActions}>
              <Pressable onPress={() => toggleFavorite(q.id)}>
                <Text style={styles.star}>
                  {q.isFavorite ? '⭐' : '☆'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert('Silinsin mi?', q.text, [
                    { text: 'İptal', style: 'cancel' },
                    {
                      text: 'Sil',
                      style: 'destructive',
                      onPress: () => removeQuote(q.id),
                    },
                  ])
                }
              >
                <Text style={[styles.star, { color: colors.danger }]}>✕</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={{ fontSize: 18 }}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function SegBtn({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segBtn,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text style={{ color: active ? '#FFF' : colors.text, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsRow, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '600' }}>
        {label}
      </Text>
      <Text style={{ color: colors.textSecondary, fontSize: FontSize.sm }}>
        {value} ›
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  title: { fontSize: FontSize.title, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { fontSize: FontSize.xs, textAlign: 'center' },
  segment: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  segBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  chartTitle: { fontSize: FontSize.md, fontWeight: '700', marginBottom: Spacing.xs },
  section: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  addQuoteCard: { gap: Spacing.md, marginBottom: Spacing.md },
  quoteInput: { fontSize: FontSize.md, minHeight: 40 },
  quoteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  quoteText: { fontSize: FontSize.sm, fontStyle: 'italic', lineHeight: 20 },
  quoteAuthor: { fontSize: FontSize.xs, marginTop: 4 },
  quoteActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  star: { fontSize: 20 },
});
