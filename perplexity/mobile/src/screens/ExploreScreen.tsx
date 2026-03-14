import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/layout/Screen';
import { spacing } from '@/theme';

export function ExploreScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <AppText variant="h1">Explore</AppText>
        <AppText variant="body" color="muted">
          Discover new content here.
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
