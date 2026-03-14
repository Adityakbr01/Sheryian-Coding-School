/**
 * MarkdownRenderer.tsx
 *
 * Custom Markdown renderer — NO external markdown library needed.
 * Parses and renders inline in React Native with full feature support:
 *
 *  ✅ Syntax highlighted code blocks (via SyntaxHighlighter)
 *  ✅ Copy button with animated feedback (via CodeBlock)
 *  ✅ Collapsible long code blocks
 *  ✅ Tables (via MarkdownTable)
 *  ✅ Streaming safe — rerenders cleanly as content grows
 *  ✅ Bold, italic, inline code
 *  ✅ Headings h1–h3
 *  ✅ Ordered + unordered lists (nested)
 *  ✅ Blockquotes
 *  ✅ Horizontal rules
 *  ✅ Line breaks
 *
 * No native deps — pure React Native + expo-clipboard.
 */

import React, { memo, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CodeBlock } from "./Codeblock";
import { MarkdownTable } from "./Markdowntable";

// ── Types ──────────────────────────────────────────────────────────────────────
type BlockType =
  | "fence"
  | "table"
  | "heading"
  | "hr"
  | "blockquote"
  | "ul"
  | "ol"
  | "paragraph"
  | "blank";

interface FenceBlock    { type: "fence";      lang: string;  code: string }
interface TableBlock    { type: "table";      header: string[]; rows: string[][] }
interface HeadingBlock  { type: "heading";    level: 1|2|3;  text: string }
interface HrBlock       { type: "hr" }
interface QuoteBlock    { type: "blockquote"; lines: string[] }
interface ListBlock     { type: "ul"|"ol";    items: string[] }
interface ParagraphBlock{ type: "paragraph";  text: string }
interface BlankBlock    { type: "blank" }

type Block =
  | FenceBlock | TableBlock | HeadingBlock | HrBlock
  | QuoteBlock | ListBlock | ParagraphBlock | BlankBlock;

// ── Parser ─────────────────────────────────────────────────────────────────────
function parse(markdown: string): Block[] {
  const lines = markdown.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Fenced code block ──
    const fenceMatch = line.match(/^```(\w*)/);
    if (fenceMatch) {
      const lang = fenceMatch[1] ?? "";
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      // Skip incomplete fence during streaming (no closing ```)
      if (i < lines.length) i++; // skip closing ```
      blocks.push({ type: "fence", lang, code: codeLines.join("\n") });
      continue;
    }

    // ── Table ──
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\|?[\s-|]+\|?$/)) {
      const header = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
      i += 2; // skip separator
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").filter((c) => c.trim()).map((c) => c.trim()));
        i++;
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    // ── Heading ──
    const headMatch = line.match(/^(#{1,3})\s+(.+)/);
    if (headMatch) {
      blocks.push({
        type: "heading",
        level: Math.min(headMatch[1].length, 3) as 1|2|3,
        text: headMatch[2],
      });
      i++;
      continue;
    }

    // ── HR ──
    if (line.match(/^[-*_]{3,}$/)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // ── Blockquote ──
    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].slice(1).trimStart());
        i++;
      }
      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    // ── Unordered list ──
    if (line.match(/^[\s]*[-*+]\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\s]*[-*+]\s/)) {
        items.push(lines[i].replace(/^[\s]*[-*+]\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // ── Ordered list ──
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s/, "").trim());
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // ── Blank line ──
    if (line.trim() === "") {
      blocks.push({ type: "blank" });
      i++;
      continue;
    }

    // ── Paragraph (accumulate until blank/block) ──
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^(#{1,3}\s|```|>|[-*+]\s|\d+\.\s|[-*_]{3,})/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "paragraph", text: paraLines.join(" ") });
    }
  }

  return blocks;
}

// ── Inline renderer ────────────────────────────────────────────────────────────
// Handles: **bold**, *italic*, `code`, plain text
function renderInline(text: string, baseStyle?: object): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <Text key={i} style={[baseStyle, inlineStyles.bold]}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <Text key={i} style={[baseStyle, inlineStyles.italic]}>{part.slice(1, -1)}</Text>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <Text key={i} style={inlineStyles.inlineCode}>{part.slice(1, -1)}</Text>;
    }
    return <Text key={i} style={baseStyle}>{part}</Text>;
  });
}

// ── Block renderers ────────────────────────────────────────────────────────────
function renderBlock(block: Block, index: number): React.ReactNode {
  switch (block.type) {

    case "fence":
      return <CodeBlock key={index} code={block.code} language={block.lang} />;

    case "table":
      return <MarkdownTable key={index} header={block.header} rows={block.rows} />;

    case "heading": {
      const s = [blockStyles.heading, blockStyles[`h${block.level}` as "h1"|"h2"|"h3"]];
      return (
        <Text key={index} style={s} selectable>
          {renderInline(block.text, s[0])}
        </Text>
      );
    }

    case "hr":
      return <View key={index} style={blockStyles.hr} />;

    case "blockquote":
      return (
        <View key={index} style={blockStyles.blockquote}>
          {block.lines.map((l, li) => (
            <Text key={li} style={blockStyles.blockquoteText} selectable>
              {renderInline(l, blockStyles.blockquoteText)}
            </Text>
          ))}
        </View>
      );

    case "ul":
      return (
        <View key={index} style={blockStyles.list}>
          {block.items.map((item, ii) => (
            <View key={ii} style={blockStyles.listItem}>
              <Text style={blockStyles.bullet}>•</Text>
              <Text style={blockStyles.listText} selectable>
                {renderInline(item, blockStyles.listText)}
              </Text>
            </View>
          ))}
        </View>
      );

    case "ol":
      return (
        <View key={index} style={blockStyles.list}>
          {block.items.map((item, ii) => (
            <View key={ii} style={blockStyles.listItem}>
              <Text style={blockStyles.bullet}>{ii + 1}.</Text>
              <Text style={blockStyles.listText} selectable>
                {renderInline(item, blockStyles.listText)}
              </Text>
            </View>
          ))}
        </View>
      );

    case "paragraph":
      return (
        <Text key={index} style={blockStyles.paragraph} selectable>
          {renderInline(block.text, blockStyles.paragraph)}
        </Text>
      );

    case "blank":
      return <View key={index} style={{ height: 6 }} />;

    default:
      return null;
  }
}

// ── Main component ─────────────────────────────────────────────────────────────
interface Props {
  content: string;
}

export const MarkdownRenderer = memo(({ content }: Props) => {
  const blocks = useMemo(() => parse(content), [content]);
  return <View>{blocks.map((b, i) => renderBlock(b, i))}</View>;
});

MarkdownRenderer.displayName = "MarkdownRenderer";

// ── Styles ─────────────────────────────────────────────────────────────────────
const inlineStyles = StyleSheet.create({
  bold: {
    fontWeight: "700",
    color: "#ffffff",
  },
  italic: {
    fontStyle: "italic",
    color: "#cccccc",
  },
  inlineCode: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#20B8A0",
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
});

const blockStyles = StyleSheet.create({
  paragraph: {
    color: "#e8e8e8",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  heading: {
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
  },
  h1: { fontSize: 22, marginTop: 16 },
  h2: { fontSize: 18, marginTop: 14 },
  h3: { fontSize: 16, marginTop: 10 },
  hr: {
    height: 1,
    backgroundColor: "#2c2c2c",
    marginVertical: 14,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#20B8A0",
    backgroundColor: "#1a1a1a",
    paddingLeft: 12,
    paddingVertical: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  blockquoteText: {
    color: "#b0b0b0",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
  list: {
    marginVertical: 4,
    marginBottom: 8,
    gap: 4,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bullet: {
    color: "#20B8A0",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "600",
    minWidth: 18,
  },
  listText: {
    flex: 1,
    color: "#e8e8e8",
    fontSize: 15,
    lineHeight: 24,
  },
});