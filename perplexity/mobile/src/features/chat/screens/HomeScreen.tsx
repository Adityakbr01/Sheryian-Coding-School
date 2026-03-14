import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/hooks/useTheme";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatMessage } from "../api/chat.api";
import AvatarCircle from "../components/AvatarCircle";
import { ChatInput } from "../components/ChatInput";
import { EmptyState } from "../components/EmptyState";
import { MessageBubble } from "../components/MessageBubble";
import type { Chip } from "../components/SuggestionChip";
import { TopNav } from "../components/TopNav";
import { useChatStore } from "../store/chat.store";
import styles from "../styles/chat.style";

const CHIPS: Chip[] = [
  { id: "1", label: "Perplexity 101", icon: "search-outline" },
  { id: "2", label: "Finance",        icon: "cash-outline"   },
  { id: "3", label: "Latest News",    icon: "search-outline" },
  { id: "4", label: "Shopping",       icon: "bag-outline"    },
  { id: "5", label: "Travel",         icon: "airplane-outline"},
];

const CHAT_INPUT_HEIGHT = 60;

export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const messages               = useChatStore((s) => s.messages);
  const isStreaming             = useChatStore((s) => s.isStreaming);
  const isLoading               = useChatStore((s) => s.isLoading);
  const sendMessage             = useChatStore((s) => s.sendMessage);
  const initialize              = useChatStore((s) => s.initialize);
  const setupSocketListeners    = useChatStore((s) => s.setupSocketListeners);
  const cleanupSocketListeners  = useChatStore((s) => s.cleanupSocketListeners);

  useEffect(() => {
    initialize();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, []);

  // ── Keyboard tracking ──────────────────────────────────────────────────────
  const keyboardHeight = useSharedValue(0);
  useKeyboardHandler(
    {
      onMove: (e) => { "worklet"; keyboardHeight.value = e.height; },
      onEnd:  (e) => { "worklet"; keyboardHeight.value = e.height; },
    },
    [],
  );

  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value + CHAT_INPUT_HEIGHT,
  }));

  /**
   * Determine what the footer indicator should show:
   *
   *  isLoading  && !isStreaming  → AI has not started replying yet → show "Thinking…"
   *  isStreaming                 → AI is actively writing a bubble  → show nothing here
   *                                (the bubble itself shows "Answering…")
   *  neither                     → idle → show nothing
   *
   * This eliminates the double-avatar situation:
   *   Before: last bubble had "AI / Answer" header AND footer showed "AI / Typing…"
   *   After:  while streaming the footer is silent; the bubble header says "Answering…"
   */
  const lastMessage = messages[messages.length - 1];
  const lastIsAssistantStreaming =
    isStreaming && lastMessage?.role === "assistant";

  const AnimatedFooter = useCallback(
    () => (
      <>
        {/*
         * Only show the thinking indicator when we are waiting for the FIRST
         * token (isLoading true, isStreaming false).
         * Once streaming starts the last message bubble itself carries the
         * "Answering…" label — no footer avatar needed.
         */}
        {isLoading && !isStreaming && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <AvatarCircle initials="AI" />
            <AppText variant="body" color="muted">Thinking…</AppText>
          </View>
        )}
        <Animated.View style={footerStyle} />
      </>
    ),
    [isLoading, isStreaming, footerStyle],
  );

  const handleSend = useCallback(() => {
    if (!query.trim()) return;
    sendMessage(query);
    setQuery("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [query, sendMessage]);

  /**
   * renderItem now passes isStreaming=true only to the LAST assistant message
   * while the stream is active. Every other bubble renders normally.
   */
  const renderItem = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <MessageBubble
        item={item}
        isStreaming={
          isStreaming &&
          index === messages.length - 1 &&
          item.role === "assistant"
        }
      />
    ),
    [isStreaming, messages.length],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const hasMessages = messages.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background ?? "#111111" }]}>
      <TopNav insets={insets} />

      <View style={{ flex: 1 }}>
        {!hasMessages ? (
          <EmptyState />
        ) : (
          <Animated.FlatList
            ref={listRef as any}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, gap: 14 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
            ListFooterComponent={AnimatedFooter}
          />
        )}
      </View>

      <ChatInput
        query={query}
        setQuery={setQuery}
        onSend={handleSend}
        isLoading={isLoading}
        colors={colors}
        showChips={!hasMessages}
        chips={CHIPS}
      />
    </View>
  );
}