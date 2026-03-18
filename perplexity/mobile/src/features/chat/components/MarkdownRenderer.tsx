/**
 * MarkdownRenderer.tsx — with Apple Color Emoji support
 *
 * Only change from previous version:
 *   All <Text> nodes that render user-visible content now use <EmojiText>.
 *   EmojiText is literally just <Text> on iOS (Apple emojis render natively),
 *   and <Text fontFamily="AppleColorEmoji"> on Android.
 *
 *   Android font fallback works at the GLYPH level:
 *     emoji chars  → AppleColorEmoji  (WhatsApp/iOS style)
 *     other chars  → system font     (Roboto, unchanged)
 *   So mixed text like "Hello 👋 world" renders perfectly.
 */

import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CodeBlock } from "./Codeblock";
import { MarkdownTable } from "./Markdowntable";
import { StreamingText } from "./Streamingtext";
import { EmojiText } from "@/components/Emojitext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FenceBlock     { type: "fence";      lang: string;   code: string }
interface TableBlock     { type: "table";      header: string[]; rows: string[][] }
interface HeadingBlock   { type: "heading";    level: 1|2|3;   text: string }
interface HrBlock        { type: "hr" }
interface QuoteBlock     { type: "blockquote"; lines: string[] }
interface ListBlock      { type: "ul"|"ol";    items: string[] }
interface ParagraphBlock { type: "paragraph";  text: string }
interface BlankBlock     { type: "blank" }

type Block =
  | FenceBlock | TableBlock | HeadingBlock | HrBlock
  | QuoteBlock | ListBlock | ParagraphBlock | BlankBlock;

// ── Parser ────────────────────────────────────────────────────────────────────
function parse(markdown: string): Block[] {
  const lines  = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { codeLines.push(lines[i]); i++; }
      if (i < lines.length) i++;
      blocks.push({ type: "fence", lang, code: codeLines.join("\n") });
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\|?[\s-|]+\|?$/)) {
      const header = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter((c) => c.trim()).map((c) => c.trim()));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    const headMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headMatch) {
      blocks.push({ type: "heading", level: Math.min(headMatch[1].length, 3) as 1|2|3, text: headMatch[2] });
      i++; continue;
    }

    if (line.match(/^[-*_]{3,}$/)) { blocks.push({ type: "hr" }); i++; continue; }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) { quoteLines.push(lines[i].slice(1).trimStart()); i++; }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    if (line.match(/^[\s]*[-*+]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s/)) { items.push(lines[i].replace(/^[\s]*[-*+]\s/, "").trim()); i++; }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) { items.push(lines[i].replace(/^\d+\.\s/, "").trim()); i++; }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (line.trim() === "") { blocks.push({ type: "blank" }); i++; continue; }

    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].match(/^(#{1,3}\s|```|>|[-*+]\s|\d+\.\s|[-*_]{3,})/)) {
      paraLines.push(lines[i]); i++;
    }
    if (paraLines.length > 0) blocks.push({ type: "paragraph", text: paraLines.join(" ") });
  }
  return blocks;
}

// ── Inline renderer — EmojiText for all visible text ─────────────────────────
function renderInline(text: string, baseStyle?: object): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <EmojiText key={i} style={[baseStyle, inlineStyles.bold]}>{part.slice(2, -2)}</EmojiText>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <EmojiText key={i} style={[baseStyle, inlineStyles.italic]}>{part.slice(1, -1)}</EmojiText>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <Text key={i} style={inlineStyles.inlineCode}>{part.slice(1, -1)}</Text>;
    return <EmojiText key={i} style={baseStyle}>{part}</EmojiText>;
  });
}

// ── Block renderer ────────────────────────────────────────────────────────────
function renderBlockContent(block: Block, isLiveBlock: boolean): React.ReactNode {
  switch (block.type) {
    case "fence":
      return <CodeBlock code={block.code} language={block.lang} />;

    case "table":
      return <MarkdownTable header={block.header} rows={block.rows} />;

    case "heading": {
      const s = [blockStyles.heading, blockStyles[`h${block.level}` as "h1"|"h2"|"h3"]];
      return <EmojiText style={s} selectable>{renderInline(block.text, s[0])}</EmojiText>;
    }

    case "hr":
      return <View style={blockStyles.hr} />;

    case "blockquote":
      return (
        <View style={blockStyles.blockquote}>
          {block.lines.map((l, li) => {
            const isLiveLine = isLiveBlock && li === block.lines.length - 1;
            return isLiveLine ? (
              <StreamingText key={li} text={l} isStreaming style={blockStyles.blockquoteText} inline />
            ) : (
              <EmojiText key={li} style={blockStyles.blockquoteText} selectable>
                {renderInline(l, blockStyles.blockquoteText)}
              </EmojiText>
            );
          })}
        </View>
      );

    case "ul":
      return (
        <View style={blockStyles.list}>
          {block.items.map((item, ii) => {
            const isLiveItem = isLiveBlock && ii === block.items.length - 1;
            return (
              <View key={ii} style={blockStyles.listItem}>
                <Text style={blockStyles.bullet}>•</Text>
                {isLiveItem ? (
                  <StreamingText text={item} isStreaming style={blockStyles.listText} inline />
                ) : (
                  <EmojiText style={blockStyles.listText} selectable>{renderInline(item, blockStyles.listText)}</EmojiText>
                )}
              </View>
            );
          })}
        </View>
      );

    case "ol":
      return (
        <View style={blockStyles.list}>
          {block.items.map((item, ii) => {
            const isLiveItem = isLiveBlock && ii === block.items.length - 1;
            return (
              <View key={ii} style={blockStyles.listItem}>
                <Text style={blockStyles.bullet}>{ii + 1}.</Text>
                {isLiveItem ? (
                  <StreamingText text={item} isStreaming style={blockStyles.listText} inline />
                ) : (
                  <EmojiText style={blockStyles.listText} selectable>{renderInline(item, blockStyles.listText)}</EmojiText>
                )}
              </View>
            );
          })}
        </View>
      );

    case "paragraph":
      return isLiveBlock ? (
        <StreamingText text={block.text} isStreaming style={blockStyles.paragraph} inline />
      ) : (
        <EmojiText style={blockStyles.paragraph} selectable>
          {renderInline(block.text, blockStyles.paragraph)}
        </EmojiText>
      );

    case "blank":
      return <View style={{ height: 6 }} />;

    default:
      return null;
  }
}

// ── Per-block memo wrapper ────────────────────────────────────────────────────
interface BlockRendererProps { block: Block; blockKey: string; isLive: boolean }

const BlockRenderer = memo(
  ({ block, isLive }: BlockRendererProps) => <>{renderBlockContent(block, isLive)}</>,
  (prev, next) => {
    if (prev.isLive !== next.isLive) return false;
    return prev.blockKey === next.blockKey;
  },
);
BlockRenderer.displayName = "BlockRenderer";

function blockKey(block: Block): string {
  switch (block.type) {
    case "fence":      return `fence:${block.lang}:${block.code}`;
    case "table":      return `table:${block.header.join(",")}`;
    case "heading":    return `h${block.level}:${block.text}`;
    case "hr":         return "hr";
    case "blockquote": return `bq:${block.lines.join("|")}`;
    case "ul":         return `ul:${block.items.join("|")}`;
    case "ol":         return `ol:${block.items.join("|")}`;
    case "paragraph":  return `p:${block.text}`;
    case "blank":      return "blank";
    default:           return "unknown";
  }
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props {
  content: string;
  isStreaming?: boolean;
  splitPoint?: number;
}

export const MarkdownRenderer = memo(({ content, isStreaming = false, splitPoint }: Props) => {
  const split = splitPoint ?? content.length;

  const stableBlocks = useMemo(
    () => parse(content.slice(0, split)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [split],
  );

  const liveBlocks = useMemo(
    () => (split < content.length ? parse(content.slice(split)) : []),
    [content, split],
  );

  const lastLiveIdx = isStreaming
    ? liveBlocks.reduce((last, b, i) => (b.type !== "blank" ? i : last), -1)
    : -1;

  return (
    <View>
      {stableBlocks.map((block, i) => (
        <BlockRenderer key={`stable-${i}`} block={block} blockKey={blockKey(block)} isLive={false} />
      ))}
      {liveBlocks.map((block, i) => (
        <BlockRenderer key={`live-${i}`} block={block} blockKey={blockKey(block)} isLive={isStreaming && i === lastLiveIdx} />
      ))}
    </View>
  );
});
MarkdownRenderer.displayName = "MarkdownRenderer";

// ── Styles ────────────────────────────────────────────────────────────────────
const inlineStyles = StyleSheet.create({
  bold:       { fontWeight: "700", color: "#ffffff" },
  italic:     { fontStyle: "italic", color: "#cccccc" },
  inlineCode: { fontFamily: "monospace", fontSize: 13, color: "#20B8A0", backgroundColor: "#1e1e1e", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
});

const blockStyles = StyleSheet.create({
  paragraph:      { color: "#e8e8e8", fontSize: 15, lineHeight: 24, marginBottom: 8 },
  heading:        { color: "#ffffff", fontWeight: "600", marginBottom: 6, marginTop: 12 },
  h1:             { fontSize: 22, marginTop: 16 },
  h2:             { fontSize: 18, marginTop: 14 },
  h3:             { fontSize: 16, marginTop: 10 },
  hr:             { height: 1, backgroundColor: "#2c2c2c", marginVertical: 14 },
  blockquote:     { borderLeftWidth: 3, borderLeftColor: "#20B8A0", backgroundColor: "#1a1a1a", paddingLeft: 12, paddingVertical: 8, marginVertical: 6, borderRadius: 4 },
  blockquoteText: { color: "#b0b0b0", fontSize: 14, fontStyle: "italic", lineHeight: 22 },
  list:           { marginVertical: 4, marginBottom: 8, gap: 4 },
  listItem:       { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  bullet:         { color: "#20B8A0", fontSize: 15, lineHeight: 24, fontWeight: "600", minWidth: 18 },
  listText:       { flex: 1, color: "#e8e8e8", fontSize: 15, lineHeight: 24 },
});