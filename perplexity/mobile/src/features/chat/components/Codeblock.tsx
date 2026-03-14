/**
 * CodeBlock.tsx
 *
 * Features:
 *  - Syntax highlighting via SyntaxHighlighter (zero native deps)
 *  - Copy button with animated ✓ feedback
 *  - Collapsible toggle for long blocks (> COLLAPSE_THRESHOLD lines)
 *  - Language badge in the header
 *  - Line numbers
 */

import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { SyntaxHighlighter } from "./Syntaxhighlighter";
// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLLAPSE_THRESHOLD = 12; // lines — collapse if longer than this
const TEAL = "#20B8A0";

interface Props {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "" }: Props) {
  const lines = code.split("\n");
  const isLong = lines.length > COLLAPSE_THRESHOLD;
  const [collapsed, setCollapsed] = useState(isLong);
  const [copied, setCopied] = useState(false);
  const copyAnim = useRef(new Animated.Value(0)).current;

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    Animated.sequence([
      Animated.timing(copyAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(copyAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setCopied(false));
  }, [code, copyAnim]);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((v) => !v);
  }, []);

  const displayCode = collapsed
    ? lines.slice(0, COLLAPSE_THRESHOLD).join("\n")
    : code;

  const langLabel = language.trim().toLowerCase() || "code";

  // Animated icon swap
  const copyIconOpacity = copyAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const checkIconOpacity = copyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      {/* ── Header bar ── */}
      <View style={styles.header}>
        <View style={styles.langBadge}>
          <Text style={styles.langText}>{langLabel}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Collapse toggle */}
          {isLong && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={handleToggle}
              activeOpacity={0.7}
            >
              <Ionicons
                name={collapsed ? "chevron-down-outline" : "chevron-up-outline"}
                size={15}
                color="#888"
              />
              <Text style={styles.headerBtnText}>
                {collapsed ? `+${lines.length - COLLAPSE_THRESHOLD} lines` : "collapse"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Copy button */}
          <TouchableOpacity
            style={[styles.headerBtn, styles.copyBtn]}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <View style={styles.iconStack}>
              <Animated.View style={{ opacity: copyIconOpacity, position: "absolute" }}>
                <Ionicons name="copy-outline" size={15} color="#aaa" />
              </Animated.View>
              <Animated.View style={{ opacity: checkIconOpacity, position: "absolute" }}>
                <Ionicons name="checkmark-outline" size={15} color={TEAL} />
              </Animated.View>
              {/* Spacer so the button has a stable size */}
              <Ionicons name="copy-outline" size={15} color="transparent" />
            </View>
            <Text style={[styles.headerBtnText, copied && { color: TEAL }]}>
              {copied ? "copied!" : "copy"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Code area ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Line numbers */}
        <View style={styles.lineNumbers}>
          {(collapsed ? lines.slice(0, COLLAPSE_THRESHOLD) : lines).map((_, i) => (
            <Text key={i} style={styles.lineNum}>
              {i + 1}
            </Text>
          ))}
        </View>

        {/* Highlighted code */}
        <View style={styles.codeArea}>
          <SyntaxHighlighter code={displayCode} language={langLabel} />
        </View>
      </ScrollView>

      {/* ── "Show more" fade overlay ── */}
      {collapsed && (
        <TouchableOpacity
          style={styles.showMoreOverlay}
          onPress={handleToggle}
          activeOpacity={0.8}
        >
          <View style={styles.fadeBar} />
          <View style={styles.showMoreBtn}>
            <Ionicons name="chevron-down-outline" size={14} color={TEAL} />
            <Text style={styles.showMoreText}>
              Show {lines.length - COLLAPSE_THRESHOLD} more lines
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginVertical: 8,
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    backgroundColor: "#1a1a1a",
  },
  langBadge: {
    backgroundColor: "#252525",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#333",
  },
  langText: {
    color: "#888",
    fontSize: 11,
    fontFamily: "monospace",
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: "#252525",
  },
  copyBtn: {
    minWidth: 72,
    justifyContent: "center",
  },
  headerBtnText: {
    color: "#888",
    fontSize: 12,
  },
  iconStack: {
    width: 15,
    height: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  // Code scroll
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    flexDirection: "row",
    padding: 12,
  },
  lineNumbers: {
    marginRight: 14,
    alignItems: "flex-end",
  },
  lineNum: {
    color: "#3d3d3d",
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 20,
    userSelect: "none",
  },
  codeArea: {
    flex: 1,
  },

  // Collapse overlay
  showMoreOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  fadeBar: {
    height: 40,
    background: "linear-gradient(180deg, rgba(20,20,20,0) 0%, rgba(20,20,20,0.85) 100%)",
    // Simulate fade — a solid bar matching the bg with some opacity trick
    backgroundColor: "rgba(20,20,20,0.85)",
  },
  showMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    backgroundColor: "#141414",
    borderTopWidth: 1,
    borderTopColor: "#2a2a2a",
  },
  showMoreText: {
    color: "#20B8A0",
    fontSize: 13,
    fontWeight: "500",
  },
});