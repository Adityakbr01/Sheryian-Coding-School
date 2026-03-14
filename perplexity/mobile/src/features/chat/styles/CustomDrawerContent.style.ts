import { StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

export const drawerStyles = StyleSheet.create({
  root: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg - 2, // 14
    paddingVertical: spacing.md - 2, // 10
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.primary + "44",
  },
  avatarText: {
    color: colors.primarySoft,
    fontSize: 13,
    fontWeight: "600",
  },
  headerUsername: {
    flex: 1,
    color: colors.textInverted,
    fontSize: 15,
    fontWeight: "500",
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  // Top tab bar
  tabBarTop: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg - 2, // 14
    paddingVertical: spacing.md - 2, // 10
    gap: spacing.sm, // 8
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tabTopBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm - 2, // 6
    paddingVertical: spacing.sm + 1, // 9
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabTopBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary + "33",
  },
  tabTopLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "500",
  },
  tabTopLabelActive: {
    color: colors.primarySoft,
  },

  // Empty state
  empty: {
    paddingTop: spacing.xxl + 20, // 52
    paddingBottom: spacing.xl, // 24
    alignItems: "center",
    gap: spacing.sm, // 8
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
    marginTop: spacing.xs, // 4
  },
  emptySubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: spacing.xxl, // 32
    lineHeight: 19,
  },

  // FAB
  fab: {
    position: "absolute",
    right: spacing.lg + 2, // 18
    bottom: spacing.xxl * 2 + 24, // 88
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fabPlus: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "300",
    lineHeight: 20,
    marginLeft: -2,
  },

  logInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: colors.danger + "88",
  },

  logPlus: {
    color: colors.textInverted,
    fontSize: 17,
    fontWeight: "300",
    lineHeight: 20,
    marginLeft: -2,
  },
});
