import { View, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius } from '../constants/theme';

interface Props {
  progress: number; // 0..1
  height?: number;
  fillColor?: string;
}

export function ProgressBar({ progress, height = 8, fillColor }: Props) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = `${clamped * 100}%` as const;

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.progressTrack, height, borderRadius: height / 2 },
      ]}
    >
      <View
        style={{
          width: pct,
          height: '100%',
          backgroundColor: fillColor ?? colors.progressFill,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: BorderRadius.full,
  },
});
