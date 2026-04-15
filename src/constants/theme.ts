// ============================================
// HabitApp - Tema Sabitleri
// ============================================

export const Colors = {
  dark: {
    background: '#0D0D0D',
    surface: '#1A1A2E',
    surfaceElevated: '#242442',
    primary: '#7C5CFC',
    primaryLight: '#9B7FFF',
    accent: '#00D4AA',
    success: '#34D399',
    successMuted: 'rgba(52, 211, 153, 0.15)',
    warning: '#FBBF24',
    danger: '#EF4444',
    text: '#F5F5F5',
    textSecondary: '#A0A0B8',
    textMuted: '#6B6B80',
    border: '#2A2A40',
    card: '#16162A',
    cardCompleted: 'rgba(52, 211, 153, 0.08)',
    streak: '#FF6B35',
    private: '#8B5CF6',
    progressTrack: '#2A2A40',
    progressFill: '#7C5CFC',
    tabBar: '#0D0D1A',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#6C47FF',
    primaryLight: '#8B6FFF',
    accent: '#00B894',
    success: '#10B981',
    successMuted: 'rgba(16, 185, 129, 0.12)',
    warning: '#F59E0B',
    danger: '#EF4444',
    text: '#1A1A2E',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    card: '#FFFFFF',
    cardCompleted: 'rgba(16, 185, 129, 0.06)',
    streak: '#FF6B35',
    private: '#7C3AED',
    progressTrack: '#E2E8F0',
    progressFill: '#6C47FF',
    tabBar: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.dark]: string };

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  title: 28,
} as const;
