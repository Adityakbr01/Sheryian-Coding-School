import { AppText } from "@/components/common/AppText";
import React from "react";
import { Image, View } from "react-native";
import styles from "../styles/chat.style";

function AvatarCircle({
  source,
  initials,
}: {
  source?: any;
  initials: string;
}) {
  return (
    <View style={styles.avatarWrapper}>
      {source ? (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          style={styles.avatarImage}
        />
      ) : (
        <View style={[styles.avatarImage, styles.avatarFallback]}>
          <AppText variant="body" style={styles.avatarInitials}>
            {initials}
          </AppText>
        </View>
      )}
    </View>
  );
}

export default AvatarCircle;
