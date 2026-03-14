/**
 * StreamingText.tsx
 *
 * Sine-wave shimmer for streaming AI responses.
 * A bright peak travels left→right across characters — identical to
 * ChatGPT / Claude's live-typing glow effect.
 *
 * Powered by react-native-reanimated (already in your project).
 * Zero extra dependencies.
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  SharedValue,
} from "react-native-reanimated";

// ── Tuning ─────────────────────────────────────────────────────────────────────
const WAVE_SPEED_MS = 1200;  // full left→right sweep duration (ms)
const WAVE_WIDTH    = 10;    // chars the bright peak spans (higher = softer glow)
const BASE_OPACITY  = 0.3;   // dim chars
const PEAK_OPACITY  = 1.0;   // bright chars at wave crest

// ── Single animated character ──────────────────────────────────────────────────
interface CharProps {
  char: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
  baseStyle: TextStyle;
}

const AnimatedChar = React.memo(
  ({ char, index, total, progress, baseStyle }: CharProps) => {
    const style = useAnimatedStyle(() => {
      "worklet";
      // wavePos sweeps from 0 → (total + WAVE_WIDTH) as progress goes 0 → 1
      const wavePos = progress.value * (total + WAVE_WIDTH);
      const dist    = Math.abs(wavePos - index);
      // Linear falloff (smooth but cheaper than Math.exp on UI thread)
      const factor  = dist < WAVE_WIDTH ? 1 - dist / WAVE_WIDTH : 0;
      return { opacity: BASE_OPACITY + (PEAK_OPACITY - BASE_OPACITY) * factor };
    });

    return (
      <Animated.Text style={[baseStyle, style]}>
        {char}
      </Animated.Text>
    );
  },
);
AnimatedChar.displayName = "AnimatedChar";

// ── Main component ─────────────────────────────────────────────────────────────
interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  style?: TextStyle;
  /** true = render inside a <Text> for inline wrapping (paragraphs) */
  inline?: boolean;
}

export function StreamingText({
  text,
  isStreaming,
  style,
  inline = false,
}: StreamingTextProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isStreaming) {
      progress.value = 0;
      progress.value = withRepeat(
        withTiming(1, { duration: WAVE_SPEED_MS, easing: Easing.linear }),
        -1,    // infinite
        false, // don't reverse — always sweeps left→right
      );
    } else {
      cancelAnimation(progress);
      progress.value = 2; // park past the end → all chars at PEAK_OPACITY
    }
  }, [isStreaming]);

  // ── Static render (not streaming) ──
  if (!isStreaming) {
    return <Text style={[st.base, style]}>{text}</Text>;
  }

  const chars    = text.split("");
  const flatBase = StyleSheet.flatten([st.base, style]) as TextStyle;

  // ── Inline mode (inside a paragraph Text wrapper) ──
  if (inline) {
    return (
      <Text style={flatBase}>
        {chars.map((ch, i) => (
          <AnimatedChar
            key={i}
            char={ch}
            index={i}
            total={chars.length}
            progress={progress}
            baseStyle={flatBase}
          />
        ))}
      </Text>
    );
  }

  // ── Block mode (flex-wrap row) ──
  return (
    <View style={st.row}>
      {chars.map((ch, i) => (
        <AnimatedChar
          key={i}
          char={ch === " " ? "\u00A0" : ch}
          index={i}
          total={chars.length}
          progress={progress}
          baseStyle={flatBase}
        />
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  base: {
    color: "#e8e8e8",
    fontSize: 15,
    lineHeight: 23,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});