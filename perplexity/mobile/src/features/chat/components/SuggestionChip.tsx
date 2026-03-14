import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import styles from "../styles/chat.style";
import { AppText } from "@/components/common/AppText";

// ── Types ──────────────────────────────────────────────────────────────────────
type Chip = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
};

function SuggestionChip({
  chip,
  borderColor,
}: {
  chip: Chip;
  borderColor: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, { borderColor }]}
      activeOpacity={0.7}
    >
      <Ionicons
        name={chip.icon}
        size={13}
        color="#888"
        style={{ marginRight: 5 }}
      />
      <AppText variant="body" style={styles.chipText}>
        {chip.label}
      </AppText>
    </TouchableOpacity>
  );
}

export { SuggestionChip, type Chip };
