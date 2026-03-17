/**
 * EmojiText.tsx
 *
 * Drop-in replacement for React Native <Text> that renders
 * iOS/WhatsApp-style emojis on both platforms:
 *
 *   iOS     → Apple Color Emoji renders automatically (system font)
 *             No font change needed. Native emoji = best performance.
 *
 *   Android → AppleColorEmoji.ttf is injected.
 *             Android's font fallback system works at the GLYPH level:
 *             - Emoji characters → rendered by AppleColorEmoji (WhatsApp-style)
 *             - Regular characters → fall back to system font (Roboto)
 *             So mixed text (e.g. "Hello 👋 world") looks correct.
 *             fontWeight / fontStyle still apply to non-emoji characters.
 *
 * Usage:
 *   import { EmojiText } from "@/components/EmojiText";
 *   <EmojiText style={styles.paragraph}>Hello 👋</EmojiText>
 *
 * Performance:
 *   - Font is loaded once at app start via expo-font plugin (zero runtime cost)
 *   - No image loading, no regex scanning, no extra components
 *   - Renders identically to <Text> — just one extra style prop on Android
 */

import React from "react";
import { Platform, Text, type TextProps } from "react-native";

// Only reference the font on Android — iOS uses system Apple Color Emoji
const EMOJI_FONT_FAMILY =
  Platform.OS === "android" ? "AppleColorEmoji" : undefined;

export const EmojiText = React.memo(
  React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
    <Text
      ref={ref}
      {...props}
      style={[
        style,
        // Inject emoji font on Android only.
        // fontFamily stacks with the existing style — emoji glyphs use Noto,
        // non-emoji glyphs fall back to whatever the parent font is.
        EMOJI_FONT_FAMILY ? { fontFamily: EMOJI_FONT_FAMILY } : undefined,
      ]}
    />
  )),
);

EmojiText.displayName = "EmojiText";