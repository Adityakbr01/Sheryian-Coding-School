import React from "react";
import { ScrollView, StyleProp, ViewStyle } from "react-native";
import styles from "../styles/chat.style";
import { Chip, SuggestionChip } from "./SuggestionChip";
import { colors } from "@/theme";

interface SuggestionChipsProps {
  chips: Chip[];
  borderColor?: string;
  style?: StyleProp<ViewStyle>;
}

export const SuggestionChips = React.memo(
  ({ chips, borderColor = colors.border, style }: SuggestionChipsProps) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsRow}
      style={style}
    >
      {chips.map((chip) => (
        <SuggestionChip key={chip.id} chip={chip} borderColor={borderColor} />
      ))}
    </ScrollView>
  ),
);

SuggestionChips.displayName = "SuggestionChips";
