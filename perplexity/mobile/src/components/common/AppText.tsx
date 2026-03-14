import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from "@/theme";
import { useTheme } from '@/hooks/useTheme';

type AppTextVariant = keyof typeof typography;
type AppTextColor = 'primary' | 'muted' | 'inverted' | 'danger' | 'warning' | 'success';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  color?: AppTextColor;
};

export function AppText({
  variant = 'body',
  color = 'primary',
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();

  const colorMap: Record<AppTextColor, string> = {
    primary: colors.text,
    muted: colors.textMuted,
    inverted: colors.textInverted,
    danger: colors.danger,
    warning: colors.warning,
    success: colors.success,
  };

  return (
    <Text
      {...props}
      style={[typography[variant] as TextStyle, { color: colorMap[color] }, style]}
    />
  );
}
