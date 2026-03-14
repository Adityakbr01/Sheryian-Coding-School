import { AppText } from "@/components/common/AppText";
import APP_INFO from "@/constants/app.info";
import React from "react";
import { View } from "react-native";
import styles from "../styles/chat.style";

export const EmptyState = React.memo(() => (
  <View style={styles.logoArea}>
    <AppText variant="h1" style={styles.logo}>
      {APP_INFO.name}
    </AppText>
  </View>
));

EmptyState.displayName = "EmptyState";
