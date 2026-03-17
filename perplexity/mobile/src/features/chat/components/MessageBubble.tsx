import { AppText } from "@/components/common/AppText";
import React, { useMemo } from "react";
import { View } from "react-native";
import type { ChatMessage } from "../api/chat.api";
import AvatarCircle from "./AvatarCircle";
import { MarkdownRenderer } from "./MarkdownRenderer";
import messageBubbleStyles from "../styles/MessageBubble.style";
import { AnsweringLabel } from "./AnsweringLabel";
import aiImage from "../../../../assets/images/girl.png";

interface MessageBubbleProps {
  item: ChatMessage;
  /** True only for the last assistant message while the stream is active */
  isStreaming?: boolean;
}

/**
 * Performance notes:
 *
 * 1. The outer component is React.memo with a custom comparator.
 *    During streaming ONLY the last bubble changes (content grows + isStreaming flag),
 *    so every completed bubble is skipped entirely — no diff, no re-render.
 *
 * 2. User bubbles never re-render after mount because their content is static.
 *
 * 3. For assistant bubbles we split content into:
 *      - "stable" chunks  → already-rendered, never touched again
 *      - "live" tail      → only the trailing ~300 chars re-render
 *    This is handled inside MarkdownRenderer via the splitPoint prop.
 */

// ── Static user bubble ────────────────────────────────────────────────────────
const UserBubble = React.memo(({ content }: { content: string }) => (
  <View style={[messageBubbleStyles.bubble, messageBubbleStyles.userBubble]}>
    <AppText variant="body" style={messageBubbleStyles.userText}>
      {content}
    </AppText>
  </View>
));
UserBubble.displayName = "UserBubble";

// ── Assistant bubble ──────────────────────────────────────────────────────────
const AssistantBubble = React.memo(
  ({ item, isStreaming }: { item: ChatMessage; isStreaming: boolean }) => {
    /**
     * splitPoint: the index at which we consider content "stable".
     * During streaming we always keep the last 300 chars as the "live tail"
     * so only that slice triggers MarkdownRenderer updates.
     * When streaming is done splitPoint === content.length → everything stable.
     */
    const splitPoint = useMemo(() => {
      if (!isStreaming) return item.content.length;
      return Math.max(0, item.content.length - 300);
    }, [isStreaming, item.content.length]);

    return (
      <View style={[messageBubbleStyles.bubble, messageBubbleStyles.assistantBubble]}>
        <View style={messageBubbleStyles.header}>
          <AvatarCircle initials="AI" source={aiImage} />
          <AnsweringLabel isStreaming={isStreaming} />
        </View>
        <MarkdownRenderer
          content={item.content}
          isStreaming={isStreaming}
          splitPoint={splitPoint}
        />
      </View>
    );
  },
);
AssistantBubble.displayName = "AssistantBubble";

// ── Outer wrapper with fine-grained memo comparator ──────────────────────────
export const MessageBubble = React.memo(
  ({ item, isStreaming = false }: MessageBubbleProps) => {
    if (item.role === "user") {
      return <UserBubble content={item.content} />;
    }
    return <AssistantBubble item={item} isStreaming={isStreaming} />;
  },
  (prev, next) => {
    // Skip re-render if nothing changed for this bubble
    if (prev.item.id !== next.item.id) return false;          // different message
    if (prev.isStreaming !== next.isStreaming) return false;   // streaming state changed
    if (prev.item.role === "assistant" && next.isStreaming) {
      // Only re-render when content actually grew
      return prev.item.content === next.item.content;
    }
    return prev.item.content === next.item.content;
  },
);

MessageBubble.displayName = "MessageBubble";