import { AppText } from "@/components/common/AppText";
import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { Pressable, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { Chip } from "./SuggestionChip";
import { SuggestionChips } from "./SuggestionChips";
import styles from "../styles/chat.style";

interface ChatInputProps {
  query: string;
  setQuery: (text: string) => void;
  isLoading: boolean;
  onSend: () => void;
  showChips?: boolean;
  chips?: Chip[];
  colors: {
    background?: string;
    surface?: string;
    border?: string;
    text?: string;
    textMuted?: string;
  };
}

export const ChatInput = React.memo(
  ({
    query,
    setQuery,
    isLoading,
    onSend,
    showChips,
    chips,
    colors,
  }: ChatInputProps) => {
    const inputRef = useRef<TextInput>(null);
    const insets = useSafeAreaInsets();

    return (
      /**
       * KeyboardStickyView sticks this view to the top of the keyboard.
       *
       * offset.closed — extra bottom space when keyboard is hidden.
       *   We use insets.bottom so it clears the home indicator on notched devices.
       * offset.opened — extra gap between keyboard top and this view.
       *   0 = flush against the keyboard, matches system app behaviour.
       */
      <KeyboardStickyView
        offset={{
          closed: insets.bottom,
          opened: 0,
        }}
        style={{
          backgroundColor: colors.background ?? "#111111",
          paddingHorizontal: 12,
          paddingTop: 8,
          paddingBottom: 40,
        }}
      >
        {showChips && chips && (
          <SuggestionChips
            chips={chips}
            borderColor={colors.border ?? "#2c2c2c"}
            style={{ marginBottom: 8 }}
          />
        )}

        <Pressable
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={() => inputRef.current?.focus()}
        >
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text ?? "#e8e8e8" }]}
            placeholder="Ask anything..."
            placeholderTextColor={colors.textMuted ?? "#555555"}
            value={query}
            onChangeText={setQuery}
            multiline
            blurOnSubmit={false}
            returnKeyType="send"
            onSubmitEditing={onSend}
            enablesReturnKeyAutomatically
          />

          <View style={styles.searchActions}>
            <TouchableOpacity style={styles.plusBtn} activeOpacity={0.7}>
              <AppText variant="body" style={styles.plusText}>
                +
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modelPill, { borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <AppText variant="body" style={styles.modelText}>
                Model
              </AppText>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="glasses-outline" size={22} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
              <Ionicons name="mic-outline" size={22} color="#888" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendBtn,
                { opacity: isLoading || !query.trim() ? 0.5 : 1 },
              ]}
              activeOpacity={0.8}
              onPress={onSend}
              disabled={isLoading || !query.trim()}
            >
              <Ionicons name="arrow-up" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardStickyView>
    );
  },
);

ChatInput.displayName = "ChatInput";
