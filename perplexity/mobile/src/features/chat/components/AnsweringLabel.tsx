/**
 * AnsweringLabel.tsx
 *
 * GPT-style animated "Answering…" label.
 *
 * When isStreaming=true:
 *   - Each character of "Answering…" gets an independent sine-wave opacity
 *   - The bright peak travels left→right continuously
 *   - Colour shifts between white and teal at the crest
 *
 * When isStreaming=false:
 *   - Renders a plain static "Answer" label — zero animation cost
 *
 * Uses react-native-reanimated only (already in your project).
 */

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolateColor,
  SharedValue,
} from "react-native-reanimated";

// ── Tuning ─────────────────────────────────────────────────────────────────────
const LABEL_TEXT    = "Answering…";
const WAVE_SPEED_MS = 1000;  // one full left→right sweep
const WAVE_WIDTH    = 4;     // chars the bright crest spans (tighter = sharper)
const BASE_OPACITY  = 0.35;  // dim chars
const PEAK_OPACITY  = 1.0;   // bright chars

const DIM_COLOR     = "#666666";  // resting colour
const PEAK_COLOR    = "#ffffff";  // teal at the crest (matches your brand)

// ── Single animated character ──────────────────────────────────────────────────
interface CharProps {
  char: string;
  index: number;
  total: number;
  progress: SharedValue<number>;
}

const AnimatedChar = React.memo(({ char, index, total, progress }: CharProps) => {
  const animStyle = useAnimatedStyle(() => {
    "worklet";
    const wavePos = progress.value * (total + WAVE_WIDTH);
    const dist    = Math.abs(wavePos - index);
    const factor  = dist < WAVE_WIDTH ? 1 - dist / WAVE_WIDTH : 0;

    const opacity = BASE_OPACITY + (PEAK_OPACITY - BASE_OPACITY) * factor;

    // Colour: interpolate from dim grey → teal as factor 0 → 1
    const color = interpolateColor(
      factor,
      [0, 1],
      [DIM_COLOR, PEAK_COLOR],
    );

    return { opacity, color };
  });

  return (
    <Animated.Text style={[styles.char, animStyle]}>
      {char}
    </Animated.Text>
  );
});
AnimatedChar.displayName = "AnimatedChar";

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  isStreaming: boolean;
}

export function AnsweringLabel({ isStreaming }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isStreaming) {
      progress.value = 0;
      progress.value = withRepeat(
        withTiming(1, { duration: WAVE_SPEED_MS, easing: Easing.linear }),
        -1,    // infinite
        false, // left→right only, no reverse
      );
    } else {
      cancelAnimation(progress);
    }
  }, [isStreaming]);

  // ── Static state: plain "Answer" label ──
  if (!isStreaming) {
    return <Text style={styles.static}>Answer</Text>;
  }

  // ── Streaming state: wave across each character ──
  const chars = LABEL_TEXT.split("");

  return (
    <View style={styles.row}>
      {chars.map((ch, i) => (
        <AnimatedChar
          key={i}
          char={ch}
          index={i}
          total={chars.length}
          progress={progress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  static: {
    color: "#aaa",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  char: {
    fontSize: 13,
    fontWeight: "500",
    // colour is driven by Reanimated — no static colour here
  },
});