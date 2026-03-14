import { colors, spacing } from "@/theme";
import { Platform, StyleSheet } from "react-native";

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },

    // Top nav
    topNav: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingBottom: 8,
    },
    avatarWrapper: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: "#333",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: 22,
    },
    avatarFallback: {
        backgroundColor: "#2e2e2e",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInitials: {
        color: "#aaa",
        fontSize: 16,
        fontWeight: "500",
    },
    proButton: {
        borderWidth: 1.5,
        borderColor: colors.primary,
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    proText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: "500",
    },

    // Logo — occupies all the flex space between nav and bottom section
    logoArea: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        color: "#e8e8e8",
        fontSize: 34,
        fontWeight: "300",
        letterSpacing: -0.5,
        fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    },

    // Bottom section
    bottomSection: {
        paddingHorizontal: 0,
        gap: spacing.sm ?? 8,
    },

    // Chips
    chipsRow: {
        paddingHorizontal: 16,
        gap: 8,
        paddingBottom: 16,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    chipText: {
        color: "#aaaaaa",
        fontSize: 12,
    },

    // Search box
    searchBox: {
        marginHorizontal: 12,
        borderRadius: 18,
        borderWidth: 1,
        overflow: "hidden",
        paddingTop: 4,
    },
    searchInput: {
        fontSize: 16,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 8,
        minHeight: 52,
        paddingLeft: 18,
    },
    searchActions: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingBottom: 14,
        gap: 8,
    },
    plusBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#2a2a2a",
        alignItems: "center",
        justifyContent: "center",
    },
    plusText: {
        color: "#aaa",
        fontSize: 22,
        lineHeight: 26,
        fontWeight: "300",
    },
    modelPill: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    modelText: {
        color: "#cccccc",
        fontSize: 14,
        fontWeight: "500",
    },
    spacer: {
        flex: 1,
    },
    iconBtn: {
        padding: 4,
    },
    sendBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
});


export default styles;