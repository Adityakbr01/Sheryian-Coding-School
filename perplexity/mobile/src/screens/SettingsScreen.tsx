import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/layout/Screen';
import { spacing } from '@/theme';

export function SettingsScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="h1">Settings</AppText>
        <AppText variant="body" color="muted">
          Manage your preferences here.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
});
