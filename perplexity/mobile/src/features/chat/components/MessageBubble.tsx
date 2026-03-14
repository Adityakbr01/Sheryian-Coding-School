import { AppText } from "@/components/common/AppText";
import React from "react";
import { StyleSheet, View } from "react-native";
import type { ChatMessage } from "../api/chat.api";
import AvatarCircle from "./AvatarCircle";
import { MarkdownRenderer } from "./MarkdownRenderer";
import messageBubbleStyles from "../styles/MessageBubble.style";
import { AnsweringLabel } from "./AnsweringLabel";

interface MessageBubbleProps {
  item: ChatMessage;
  /** True only for the last assistant message while the stream is active */
  isStreaming?: boolean;
}

export const MessageBubble = React.memo(({ item, isStreaming = false }: MessageBubbleProps) => {
  const isUser = item.role === "user";

  return (
    <View
      style={[
        messageBubbleStyles.bubble,
        isUser ? messageBubbleStyles.userBubble : messageBubbleStyles.assistantBubble,
      ]}
    >
      {!isUser && (
        <View style={messageBubbleStyles.header}>
          <AvatarCircle initials="AI" />
          <AnsweringLabel isStreaming={isStreaming} />
        </View>
      )}

      {isUser ? (
        <AppText variant="body" style={messageBubbleStyles.userText}>
          {item.content}
        </AppText>
      ) : (
        /**
         * Pass isStreaming to MarkdownRenderer so the sine-wave shimmer
         * is applied only to the live trailing block of the response.
         * Completed blocks stay static.
         */
        <MarkdownRenderer content={item.content} isStreaming={isStreaming} />
      )}
    </View>
  );
});

MessageBubble.displayName = "MessageBubble";