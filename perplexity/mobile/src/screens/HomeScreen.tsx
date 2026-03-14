import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/layout/Screen';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export function HomeScreen() {
  const { colors } = useTheme();

  return (
    <Screen>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppText variant="h1">Perplexity Mobile</AppText>
        <AppText variant="body" color="muted" style={styles.subtitle}>
          Expo + Bun + TypeScript starter with a scalable folder structure.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  subtitle: {
    lineHeight: 22,
  },
});
