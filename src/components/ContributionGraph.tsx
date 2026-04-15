import { View, Text, StyleSheet, Pressable } from 'react-native';
import dayjs from 'dayjs';
import { useTheme } from '../hooks/useTheme';
import { useTaskStore } from '../store/useTaskStore';
import { FontSize, Spacing } from '../constants/theme';

interface Props {
  weeks?: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const DAY_LABELS = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'];

export function ContributionGraph({ weeks = 20, selectedDate, onSelectDate }: Props) {
  const { colors } = useTheme();
  const completions = useTaskStore((s) => s.completions);
  const tasks = useTaskStore((s) => s.tasks);

  const today = dayjs();
  const startDate = today.subtract(weeks * 7 - 1, 'day');
  const startWeekday = (startDate.day() + 6) % 7; // Pzt=0..Paz=6

  const totalCells = weeks * 7;
  const cells: { date: string | null; intensity: number }[] = [];

  for (let i = 0; i < totalCells; i++) {
    const offset = i - startWeekday;
    if (offset < 0) {
      cells.push({ date: null, intensity: 0 });
      continue;
    }
    const d = startDate.add(offset, 'day');
    if (d.isAfter(today, 'day')) {
      cells.push({ date: null, intensity: 0 });
      continue;
    }
    const dateStr = d.format('YYYY-MM-DD');

    const activeTasks = tasks.filter((t) => {
      if (!t.isActive) return false;
      return dateStr >= dayjs(t.createdAt).format('YYYY-MM-DD');
    });
    if (activeTasks.length === 0) {
      cells.push({ date: dateStr, intensity: 0 });
      continue;
    }
    const done = activeTasks.filter(
      (t) => completions[`${t.id}_${dateStr}`]?.isCompleted,
    ).length;
    const ratio = done / activeTasks.length;
    cells.push({ date: dateStr, intensity: ratio });
  }

  // sütunlara böl
  const columns: typeof cells[] = [];
  for (let c = 0; c < weeks; c++) {
    columns.push(cells.slice(c * 7, c * 7 + 7));
  }

  const intensityColor = (intensity: number) => {
    if (intensity === 0) return colors.progressTrack;
    if (intensity < 0.34) return 'rgba(52, 211, 153, 0.3)';
    if (intensity < 0.67) return 'rgba(52, 211, 153, 0.6)';
    if (intensity < 1) return 'rgba(52, 211, 153, 0.85)';
    return colors.success;
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.labels}>
          {DAY_LABELS.map((l, i) => (
            <Text
              key={i}
              style={[styles.dayLabel, { color: colors.textMuted }]}
            >
              {l}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {columns.map((col, ci) => (
            <View key={ci} style={styles.col}>
              {col.map((cell, ri) => {
                const isSelected = cell.date === selectedDate;
                return (
                  <Pressable
                    key={ri}
                    disabled={!cell.date}
                    onPress={() => cell.date && onSelectDate(cell.date)}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: cell.date
                          ? intensityColor(cell.intensity)
                          : 'transparent',
                        borderColor: isSelected ? colors.primary : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={[styles.legendText, { color: colors.textMuted }]}>
          Az
        </Text>
        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <View
            key={i}
            style={[styles.legendCell, { backgroundColor: intensityColor(v) }]}
          />
        ))}
        <Text style={[styles.legendText, { color: colors.textMuted }]}>
          Çok
        </Text>
      </View>
    </View>
  );
}

const CELL = 14;
const GAP = 3;

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm },
  labels: { justifyContent: 'space-between', paddingVertical: 2 },
  dayLabel: { fontSize: 9, height: CELL },
  grid: { flexDirection: 'row', gap: GAP, flex: 1 },
  col: { gap: GAP },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 3,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
  },
  legendText: { fontSize: FontSize.xs },
  legendCell: { width: CELL - 2, height: CELL - 2, borderRadius: 3 },
});
