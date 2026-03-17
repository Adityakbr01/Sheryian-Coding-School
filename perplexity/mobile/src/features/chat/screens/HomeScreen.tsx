/**
 * HomeScreen.tsx — freeze-free streaming
 *
 * The single most important change:
 *   BEFORE: messages = useChatStore(s => s.messages)
 *           → re-renders on EVERY token (50-100/s) → JS thread saturates → freeze
 *
 *   AFTER:  messages = useThrottledMessages(50)
 *           → re-renders at most every 50ms (20fps) → JS thread free → smooth
 *
 * isStreaming / isLoading keep normal subscriptions because they only flip
 * true→false once per message, not on every token.
 */

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
import aiImage from "@assets/images/3D-Cartoon-Avatar.jpg";
import { useThrottledMessages } from "../hooks/useThrottledSelector";

const CHIPS: Chip[] = [
  { id: "1", label: "Perplexity 101", icon: "search-outline" },
  { id: "2", label: "Finance",        icon: "cash-outline"   },
  { id: "3", label: "Latest News",    icon: "search-outline" },
  { id: "4", label: "Shopping",       icon: "bag-outline"    },
  { id: "5", label: "Travel",         icon: "airplane-outline" },
];

const CHAT_INPUT_HEIGHT = 60;

// ── ListFooter: outside component so FlatList ref is always stable ─────────
const ListFooter = React.memo(
  ({
    isLoading,
    isStreaming,
    footerStyle,
  }: {
    isLoading: boolean;
    isStreaming: boolean;
    footerStyle: any;
  }) => (
    <>
      {isLoading && !isStreaming && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <AvatarCircle initials="AI" source={aiImage} />
          <AppText variant="body" color="muted">Thinking…</AppText>
        </View>
      )}
      <Animated.View style={footerStyle} />
    </>
  ),
);
ListFooter.displayName = "ListFooter";

export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // ── CRITICAL: throttled at 20fps — not on every token ─────────────────────
  // Before this fix, every token caused a React re-render. At 50-100 tokens/s
  // the JS thread was fully saturated — causing the freeze + drawer lock.
  const messages = useThrottledMessages(50);

  // These only change once per message (not per token) — normal selectors OK
  const isStreaming            = useChatStore((s) => s.isStreaming);
  const isLoading              = useChatStore((s) => s.isLoading);
  const sendMessage            = useChatStore((s) => s.sendMessage);
  const initialize             = useChatStore((s) => s.initialize);
  const setupSocketListeners   = useChatStore((s) => s.setupSocketListeners);
  const cleanupSocketListeners = useChatStore((s) => s.cleanupSocketListeners);

  useEffect(() => {
    initialize();
    setupSocketListeners();
    return () => cleanupSocketListeners();
  }, []);

  // ── Keyboard ───────────────────────────────────────────────────────────────
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

  // ── Scroll ─────────────────────────────────────────────────────────────────
  const userScrolledUp    = useRef(false);
  const lastContentHeight = useRef(0);

  const scrollToBottom = useCallback((animated = true) => {
    if (!userScrolledUp.current) {
      listRef.current?.scrollToEnd({ animated });
    }
  }, []);

  const handleContentSizeChange = useCallback(
    (_w: number, h: number) => {
      if (h !== lastContentHeight.current) {
        lastContentHeight.current = h;
        scrollToBottom(false);
      }
    },
    [scrollToBottom],
  );

  const handleScroll = useCallback((e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const distanceFromBottom =
      contentSize.height - contentOffset.y - layoutMeasurement.height;
    userScrolledUp.current = distanceFromBottom > 40;
  }, []);

  const handleSend = useCallback(() => {
    if (!query.trim()) return;
    userScrolledUp.current = false;
    sendMessage(query);
    setQuery("");
    setTimeout(() => scrollToBottom(true), 50);
  }, [query, sendMessage, scrollToBottom]);

  // ── Footer ─────────────────────────────────────────────────────────────────
  const renderFooter = useCallback(
    () => (
      <ListFooter
        isLoading={isLoading}
        isStreaming={isStreaming}
        footerStyle={footerStyle}
      />
    ),
    [isLoading, isStreaming, footerStyle],
  );

  // ── renderItem ─────────────────────────────────────────────────────────────
  const messagesLength = messages.length;

  const renderItem = useCallback(
    ({ item, index }: { item: ChatMessage; index: number }) => (
      <MessageBubble
        item={item}
        isStreaming={
          isStreaming &&
          index === messagesLength - 1 &&
          item.role === "assistant"
        }
      />
    ),
    [isStreaming, messagesLength],
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
            initialNumToRender={15}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            windowSize={10}
            removeClippedSubviews={false}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onContentSizeChange={handleContentSizeChange}
            onLayout={() => scrollToBottom(true)}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            ListFooterComponent={renderFooter}
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