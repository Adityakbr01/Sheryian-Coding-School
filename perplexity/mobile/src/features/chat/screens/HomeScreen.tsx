import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/hooks/useTheme";
import React, { useCallback, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ChatMessage } from "../api/chat.api";
import AvatarCircle from "../components/AvatarCircle";
import { ChatInput } from "../components/ChatInput";
import { EmptyState } from "../components/EmptyState";
import { MessageBubble } from "../components/MessageBubble";
import type { Chip } from "../components/SuggestionChip";
import { TopNav } from "../components/TopNav";
import { useChat } from "../hooks/useChat";
import styles from "../styles/chat.style";

// ── Constants ──────────────────────────────────────────────────────────────────
const CHIPS: Chip[] = [
  { id: "1", label: "Perplexity 101", icon: "search-outline" },
  { id: "2", label: "Finance", icon: "cash-outline" },
  { id: "3", label: "Latest News", icon: "search-outline" },
  { id: "4", label: "Shopping", icon: "bag-outline" },
  { id: "5", label: "Travel", icon: "airplane-outline" },
];

// The approximate height of ChatInput (box + padding). Adjust if needed.
const CHAT_INPUT_HEIGHT = 60;

// ── Screen ─────────────────────────────────────────────────────────────────────
export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { messages, isLoading, sendMessage } = useChat();

  /**
   * keyboardHeight tracks keyboard height on the UI thread via Reanimated.
   * useKeyboardHandler fires on every animation frame — same source that
   * KeyboardStickyView uses — so the list footer and the input always move together.
   */
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (e) => {
        "worklet";
        keyboardHeight.value = e.height;
      },
      onEnd: (e) => {
        "worklet";
        keyboardHeight.value = e.height;
      },
    },
    [],
  );


  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value + CHAT_INPUT_HEIGHT,
  }));

  const AnimatedFooter = useCallback(
    () => (
      <>
        {isLoading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 8,
            }}
          >
            <AvatarCircle initials="AI" />
            <AppText variant="body" color="muted">
              Thinking...
            </AppText>
          </View>
        )}
        {/* This spacer animates in sync with the keyboard */}
        <Animated.View style={footerStyle} />
      </>
    ),
    [isLoading, footerStyle],
  );

  const handleSend = useCallback(() => {
    if (!query.trim()) return;
    sendMessage(query);
    setQuery("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }, [query, sendMessage]);

  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => <MessageBubble item={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const hasMessages = messages.length > 0;

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background ?? "#111111" }]}
    >
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
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              gap: 14,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            /**
             * The animated spacer lives here — inside the scroll content.
             * As the keyboard rises, this spacer grows, pushing all messages
             * upward and keeping the latest one visible above the input box.
             */
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