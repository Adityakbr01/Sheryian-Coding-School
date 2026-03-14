import { AppText } from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { chatRowStyles as styles } from "../../styles/ChatRow.style";

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return `${Math.floor(d / 7)}w`;
}

interface ChatRowProps {
  item: any;
  isActive: boolean;
  onPress: () => void;
  onMenu: () => void;
}

export function ChatRow({ item, isActive, onPress, onMenu }: ChatRowProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.row, isActive && styles.rowActive]}
    >
      <View style={styles.rowBody}>
        <AppText numberOfLines={2} style={styles.rowTitle}>
          {item.title || "New Chat"}
        </AppText>
        {!!item.preview && (
          <AppText numberOfLines={2} style={styles.rowPreview}>
            {item.preview}
          </AppText>
        )}
        <View style={styles.rowMeta}>
          <Ionicons name="lock-closed-outline" size={11} color={styles.rowMetaText.color as string} />
          <View style={styles.dot} />
          <Ionicons name="time-outline" size={11} color={styles.rowMetaText.color as string} />
          <AppText style={styles.rowMetaText}>
            {timeAgo(item.updatedAt ?? item.createdAt)}
          </AppText>
        </View>
      </View>
      <TouchableOpacity
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        onPress={onMenu}
        style={styles.menuBtn}
      >
        <Ionicons name="ellipsis-vertical" size={17} color={styles.rowMetaText.color as string} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
