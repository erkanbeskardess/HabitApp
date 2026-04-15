import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../src/hooks/useTheme';
import { useTaskStore } from '../src/store/useTaskStore';
import { Button } from '../src/components/Button';
import { BorderRadius, FontSize, Spacing } from '../src/constants/theme';
import type { TaskType } from '../src/types';

const ICONS = ['💧', '📚', '🏃', '🧘', '🍎', '💪', '😴', '✍️', '🎯', '🧠', '🎨', '🌱'];

export default function TaskFormScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ taskId?: string }>();
  const isEditing = !!params.taskId;

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const existing = useMemo(
    () => tasks.find((t) => t.id === params.taskId),
    [tasks, params.taskId],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [type, setType] = useState<TaskType>(existing?.type ?? 'boolean');
  const [target, setTarget] = useState(existing?.target?.toString() ?? '');
  const [unit, setUnit] = useState(existing?.unit ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? '🎯');
  const [isPrivate, setIsPrivate] = useState(existing?.isPrivate ?? false);
  const [isFlexible, setIsFlexible] = useState(existing?.isFlexible ?? true);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Görev başlığı boş olamaz.');
      return;
    }
    if (type === 'numeric') {
      const t = parseInt(target, 10);
      if (!t || t < 1) {
        Alert.alert('Hata', 'Geçerli bir hedef sayı gir.');
        return;
      }
    }

    const payload = {
      title: title.trim(),
      type,
      target: type === 'numeric' ? parseInt(target, 10) : undefined,
      unit: type === 'numeric' ? unit.trim() || undefined : undefined,
      icon,
      isPrivate,
      isFlexible,
    };

    if (isEditing && existing) {
      updateTask(existing.id, payload);
    } else {
      addTask(payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existing) return;
    Alert.alert('Görevi Sil', `"${existing.title}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          deleteTask(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.headerBtn, { color: colors.textSecondary }]}>
              İptal
            </Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditing ? 'Görevi Düzenle' : 'Yeni Görev'}
          </Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.headerBtn, { color: colors.primary }]}>
              Kaydet
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Başlık */}
          <Label text="Başlık" />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="ör: 3 Litre Su İç"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
            ]}
          />

          {/* Tip Seçimi */}
          <Label text="Görev Tipi" />
          <View style={styles.segment}>
            <SegmentBtn
              label="✓ Basit"
              active={type === 'boolean'}
              onPress={() => setType('boolean')}
            />
            <SegmentBtn
              label="📊 Ölçülü"
              active={type === 'numeric'}
              onPress={() => setType('numeric')}
            />
          </View>

          {type === 'numeric' ? (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Label text="Hedef" />
                <TextInput
                  value={target}
                  onChangeText={setTarget}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Label text="Birim" />
                <TextInput
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="Litre, Sayfa..."
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                  ]}
                />
              </View>
            </View>
          ) : null}

          {/* İkon */}
          <Label text="İkon" />
          <View style={styles.iconGrid}>
            {ICONS.map((i) => (
              <Pressable
                key={i}
                onPress={() => setIcon(i)}
                style={[
                  styles.iconBtn,
                  {
                    backgroundColor: icon === i ? colors.primary : colors.card,
                    borderColor: icon === i ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{i}</Text>
              </Pressable>
            ))}
          </View>

          {/* Toggles */}
          <ToggleRow
            label="🔒 Gizli Görev"
            description="Bu görev FaceID/Parmak İzi ile açılır."
            value={isPrivate}
            onChange={setIsPrivate}
          />
          <ToggleRow
            label="📅 Esnek Takip"
            description="Geçmiş günlere dönük işaretleme yapılabilir."
            value={isFlexible}
            onChange={setIsFlexible}
          />

          {isEditing ? (
            <Button
              title="Görevi Sil"
              variant="danger"
              icon="🗑"
              onPress={handleDelete}
              style={{ marginTop: Spacing.xl }}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Label({ text }: { text: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.label, { color: colors.textSecondary }]}>{text}</Text>
  );
}

function SegmentBtn({
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
        styles.segmentBtn,
        {
          backgroundColor: active ? colors.primary : colors.card,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      <Text
        style={{
          color: active ? '#FFFFFF' : colors.text,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={[
        styles.toggleRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '600' }}>
          {label}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: FontSize.sm,
            marginTop: 2,
          }}
        >
          {description}
        </Text>
      </View>
      <View
        style={[
          styles.toggle,
          { backgroundColor: value ? colors.primary : colors.border },
        ]}
      >
        <View
          style={[
            styles.toggleKnob,
            { transform: [{ translateX: value ? 22 : 2 }] },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerBtn: { fontSize: FontSize.md, fontWeight: '600' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl * 2 },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  segment: { flexDirection: 'row', gap: Spacing.sm },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
});
