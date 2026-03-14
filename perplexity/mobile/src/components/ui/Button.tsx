import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  TouchableOpacityProps, 
  ActivityIndicator, 
  ViewStyle,
  TextStyle 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/common/AppText';
import { spacing, radius } from '@/theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  loading,
  icon,
  iconPosition = 'left',
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surface; // Often used for Google/Apple buttons
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary': return colors.textInverted;
      case 'secondary': return colors.text;
      case 'outline': return colors.text;
      case 'ghost': return colors.text;
      default: return colors.textInverted;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return colors.border;
    if (variant === 'secondary') return colors.border;
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 48;
      case 'lg': return 56;
      default: return 48;
    }
  };

  const containerStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: (variant === 'outline' || variant === 'secondary') ? 1 : 0,
    height: getHeight(),
    borderRadius: radius.md, // Perplexity uses rounded buttons, typically fully rounded or slightly rounded (md/lg)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    opacity: disabled ? 0.7 : 1,
    gap: spacing.sm,
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={20} color={getTextColor()} />
          )}
          <AppText 
            variant="body" 
            style={{ 
              color: getTextColor(), 
              fontWeight: '600',
              fontSize: size === 'sm' ? 14 : 16 
            }}
          >
            {label}
          </AppText>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={20} color={getTextColor()} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
