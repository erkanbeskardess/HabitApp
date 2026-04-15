import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Card } from './Card';
import { ProgressBar } from './ProgressBar';
import { useTheme } from '../hooks/useTheme';
import { useTaskStore } from '../store/useTaskStore';
import { BorderRadius, FontSize, Spacing } from '../constants/theme';
import type { Task } from '../types';

interface Props {
  task: Task;
  date: string;
  onLongPress?: (task: Task) => void;
}

export function TaskCard({ task, date, onLongPress }: Props) {
  const { colors } = useTheme();
  const completion = useTaskStore((s) => s.completions[`${task.id}_${date}`]);
  const streak = useTaskStore((s) => s.getStreak(task.id));
  const toggleCompletion = useTaskStore((s) => s.toggleCompletion);
  const incrementProgress = useTaskStore((s) => s.incrementProgress);
  const decrementProgress = useTaskStore((s) => s.decrementProgress);

  const isCompleted = completion?.isCompleted ?? false;
  const progress = completion?.progress ?? 0;
  const target = task.target ?? 1;
  const ratio = task.type === 'numeric' ? progress / target : isCompleted ? 1 : 0;

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(task);
      return;
    }
    Alert.alert(task.title, 'Ne yapmak istersin?', [
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <Pressable onLongPress={handleLongPress} delayLongPress={400}>
      <Card completed={isCompleted} style={styles.card}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              {task.icon ? (
                <Text style={styles.taskIcon}>{task.icon}</Text>
              ) : null}
              <Text
                style={[
                  styles.title,
                  {
                    color: isCompleted ? colors.textSecondary : colors.text,
                    textDecorationLine: isCompleted && task.type === 'boolean' ? 'line-through' : 'none',
                  },
                ]}
                numberOfLines={1}
              >
                {task.title}
              </Text>
              {task.isPrivate ? (
                <Text style={styles.privateIcon}>🔒</Text>
              ) : null}
            </View>
            {task.type === 'numeric' ? (
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {progress} / {target} {task.unit ?? ''}
              </Text>
            ) : null}
          </View>

          {streak.currentStreak > 0 ? (
            <View style={[styles.streakBadge, { backgroundColor: colors.successMuted }]}>
              <Text style={styles.streakText}>🔥 {streak.currentStreak}</Text>
            </View>
          ) : null}
        </View>

        {task.type === 'numeric' ? (
          <View style={styles.numericBody}>
            <ProgressBar
              progress={ratio}
              fillColor={isCompleted ? colors.success : colors.progressFill}
            />
            <View style={styles.numericControls}>
              <Pressable
                onPress={() => decrementProgress(task.id, date)}
                style={[styles.ctrlBtn, { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.ctrlText, { color: colors.text }]}>−</Text>
              </Pressable>
              <Pressable
                onPress={() => incrementProgress(task.id, date)}
                style={[
                  styles.ctrlBtn,
                  {
                    backgroundColor: isCompleted ? colors.success : colors.primary,
                  },
                ]}
              >
                <Text style={[styles.ctrlText, { color: '#FFFFFF' }]}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => toggleCompletion(task.id, date)}
            style={[
              styles.checkbox,
              {
                backgroundColor: isCompleted ? colors.success : 'transparent',
                borderColor: isCompleted ? colors.success : colors.border,
              },
            ]}
          >
            {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
          </Pressable>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.md, gap: Spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  taskIcon: { fontSize: FontSize.lg },
  title: { fontSize: FontSize.lg, fontWeight: '600', flexShrink: 1 },
  subtitle: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  privateIcon: { fontSize: FontSize.sm, opacity: 0.7 },
  streakBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  streakText: { fontSize: FontSize.sm, fontWeight: '700', color: '#FF6B35' },
  numericBody: { gap: Spacing.md },
  numericControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  ctrlBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlText: { fontSize: FontSize.xl, fontWeight: '700' },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  checkmark: { color: '#FFFFFF', fontWeight: '800', fontSize: FontSize.md },
});
