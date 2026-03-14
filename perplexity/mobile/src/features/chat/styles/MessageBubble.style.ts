import { StyleSheet } from "react-native";

const messageBubbleStyles = StyleSheet.create({
  bubble: {
    maxWidth: "88%",
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#2a2a2a",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  assistantBubble: {
    alignSelf: "flex-start",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  label: {
    color: "#aaa",
    fontSize: 13,
  },
  userText: {
    color: "#e8e8e8",
    fontSize: 15,
    lineHeight: 22,
  },
});

export default messageBubbleStyles;