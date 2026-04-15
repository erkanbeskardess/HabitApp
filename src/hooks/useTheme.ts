import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '../constants/theme';
import { useTaskStore } from '../store/useTaskStore';

export function useTheme(): { colors: ThemeColors; mode: 'light' | 'dark' } {
  const systemScheme = useColorScheme();
  const themeMode = useTaskStore((s) => s.settings.themeMode);

  const resolved =
    themeMode === 'system' ? (systemScheme ?? 'dark') : themeMode;
  const mode = resolved === 'light' ? 'light' : 'dark';

  return { colors: Colors[mode], mode };
}
