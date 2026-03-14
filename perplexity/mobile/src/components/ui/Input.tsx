import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  TextInputProps, 
  ViewStyle 
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from '@/components/common/AppText';
import { spacing, radius } from '@/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function Input({
  label,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const borderColor = error 
    ? colors.danger 
    : isFocused 
      ? colors.primary 
      : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText 
          variant="caption" 
          style={{ marginBottom: spacing.xs, color: colors.textMuted }}
        >
          {label}
        </AppText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor,
            color: colors.text,
            borderRadius: radius.md,
          },
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {error && (
        <AppText 
          variant="caption" 
          color="danger" 
          style={{ marginTop: spacing.xs }}
        >
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    height: 52,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
});
