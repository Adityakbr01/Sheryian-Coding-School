import { StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

export const chatRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 1,
    color: colors.text,
  },
  rowActive: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    color: colors.text,
  },
  rowBody: {
    
    flex: 1,
    gap: spacing.xs / 2, // 3
  },
  rowTitle: {
    color: colors.textInverted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  rowPreview: {
    color: colors.textInverted,
    fontSize: 13,
    lineHeight: 19,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs + 1, // 5
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.icon,
  },
  rowMetaText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  menuBtn: {
    paddingLeft: spacing.md - 2, // 10
    paddingTop: 2,
  },
});
