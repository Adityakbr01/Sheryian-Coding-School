import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';
import { lightColors, darkColors, ThemeColors } from '@/theme/colors';

export function useTheme() {
  const { resolvedTheme, toggleTheme, themeMode } = useContext(ThemeContext);
  const colors: ThemeColors = resolvedTheme === 'dark' ? darkColors : lightColors;

  return {
    colors,
    isDark: resolvedTheme === 'dark',
    scheme: resolvedTheme,
    toggleTheme,
    themeMode,
  };
}
