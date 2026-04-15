import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { BorderRadius, Spacing } from '../constants/theme';

interface Props extends ViewProps {
  completed?: boolean;
  style?: ViewStyle;
}

export function Card({ completed, style, children, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <View
      {...rest}
      style={[
        styles.card,
        {
          backgroundColor: completed ? colors.cardCompleted : colors.card,
          borderColor: completed ? colors.success : colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
});
