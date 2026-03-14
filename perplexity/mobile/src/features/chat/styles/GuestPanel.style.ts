import { StyleSheet } from "react-native";
import { colors, spacing } from "@/theme";

export const guestStyles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl + 16, // 48
    paddingBottom: spacing.xxl, // 32
    justifyContent: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 2, // 10
    marginBottom: spacing.lg - 2, // 14
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  brandName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "300",
    letterSpacing: -0.5,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.xl + 4, // 28
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md - 2, // 10
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg - 2, // 14
    alignItems: "center",
    marginBottom: spacing.md - 2, // 10
  },
  loginBtnText: {
    color: colors.textInverted,
    fontSize: 15,
    fontWeight: "600",
  },
  registerBtn: {
    borderRadius: 14,
    paddingVertical: spacing.lg - 2, // 14
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl - 4, // 20
  },
  registerBtnText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  terms: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});
