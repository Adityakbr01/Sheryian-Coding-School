
const palette = {
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Perplexity-inspired
  darkBg: '#191A1A',
  darkSurface: '#2D2F2F', 
  perplexityTeal: '#20B2AA',
  perplexityDarkTeal: '#138988',
};

export const lightColors = {
  background: palette.white,
  surface: palette.gray100,
  border: palette.gray200,
  primary: palette.perplexityDarkTeal,
  primarySoft: '#E0F2F1',
  text: palette.gray900,
  textMuted: palette.gray500,
  textInverted: palette.white,
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  icon: palette.gray600,
};

export const darkColors = {
  background: palette.darkBg,
  surface: palette.darkSurface,
  border: palette.gray700,
  primary: palette.perplexityTeal,
  primarySoft: '#1A3C3C',
  text: palette.gray100,
  textMuted: palette.gray400,
  textInverted: palette.black,
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  icon: palette.gray300,
};

export type ThemeColors = typeof lightColors;

// Default export for backward compatibility relative to the import path, 
// though we will migrate to useTheme.
export const colors = lightColors;

