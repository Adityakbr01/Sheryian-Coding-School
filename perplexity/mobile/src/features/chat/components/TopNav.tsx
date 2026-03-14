import { AppText } from "@/components/common/AppText";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import styles from "../styles/chat.style";
import AvatarCircle from "./AvatarCircle";

interface TopNavProps {
  insets: EdgeInsets;
}

export const TopNav = React.memo(({ insets }: TopNavProps) => (
  <View style={[styles.topNav, { paddingTop: insets.top + 8 }]}>
    <AvatarCircle
      initials="A"
      source={require("../../../../public/images/astro.png")}
    />
    <TouchableOpacity style={styles.proButton} activeOpacity={0.8}>
      <AppText variant="body" style={styles.proText}>
        Get Pro →
      </AppText>
    </TouchableOpacity>
    <AvatarCircle initials="P" />
  </View>
));

TopNav.displayName = "TopNav";
