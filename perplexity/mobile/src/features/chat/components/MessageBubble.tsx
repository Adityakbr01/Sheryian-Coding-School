/**
 * MessageBubble.tsx
 *
 * No external markdown packages needed — uses custom MarkdownRenderer
 * which handles everything internally with zero native dependencies.
 */

import { AppText } from "@/components/common/AppText";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { ChatMessage } from "../api/chat.api";
import AvatarCircle from "./AvatarCircle";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  item: ChatMessage;
}

export const MessageBubble = React.memo(({ item }: MessageBubbleProps) => {
  const isUser = item.role === "user";

  return (
    <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {!isUser && (
        <View style={styles.header}>
          <AvatarCircle initials="AI" />
          <AppText variant="body" style={styles.label}>
            Answer
          </AppText>
        </View>
      )}

      {isUser ? (
        <AppText variant="body" style={styles.userText}>
          {item.content}
        </AppText>
      ) : (
        <MarkdownRenderer content={item.content} />
      )}
    </View>
  );
});

MessageBubble.displayName = "MessageBubble";

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
  },
  userText: {
    color: "#e8e8e8",
    fontSize: 15,
    lineHeight: 22,
  },
});