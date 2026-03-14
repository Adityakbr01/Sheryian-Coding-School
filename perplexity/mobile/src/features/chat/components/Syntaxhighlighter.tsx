/**
 * SyntaxHighlighter.tsx
 *
 * Zero-dependency syntax highlighter — no native modules, works in Expo Go.
 * Token-based regex highlighter for the most common languages.
 *
 * Supported: js/ts/jsx/tsx, python, bash/sh, json, css, html, sql, go, rust, java
 */

import React, { useMemo } from "react";
import { Text, View, StyleSheet } from "react-native";

// ── Token types & theme ────────────────────────────────────────────────────────
type TokenType =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "operator"
  | "type"
  | "tag"
  | "attribute"
  | "builtin"
  | "punctuation"
  | "plain";

// VS Code Dark+ inspired palette
const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:    "#C586C0", // purple — if, const, return …
  string:     "#CE9178", // orange — "hello"
  comment:    "#6A9955", // green  — // comment
  number:     "#B5CEA8", // light green — 42, 3.14
  function:   "#DCDCAA", // yellow — myFunc()
  operator:   "#D4D4D4", // white  — = + - =>
  type:       "#4EC9B0", // teal   — string, number, React
  tag:        "#569CD6", // blue   — <div>
  attribute:  "#9CDCFE", // light blue — className=
  builtin:    "#4EC9B0", // teal   — console, Math
  punctuation:"#808080", // grey   — { } ( ) , ;
  plain:      "#D4D4D4", // default
};

type Token = { type: TokenType; value: string };

// ── Language definitions ───────────────────────────────────────────────────────
type Rule = { regex: RegExp; type: TokenType };

const JS_KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|default|from|new|this|typeof|instanceof|void|delete|throw|try|catch|finally|async|await|of|in|static|get|set|null|undefined|true|false)\b/;
const TS_TYPES    = /\b(string|number|boolean|any|never|void|unknown|object|symbol|bigint|type|interface|enum|namespace|declare|readonly|abstract|implements|keyof|infer|as|satisfies)\b/;
const PY_KEYWORDS = /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|pass|break|continue|lambda|yield|global|nonlocal|and|or|not|in|is|True|False|None|async|await)\b/;
const BUILTINS    = /\b(console|Math|Object|Array|String|Number|Boolean|JSON|Promise|Error|Date|RegExp|Map|Set|WeakMap|WeakSet|Symbol|Proxy|Reflect|Intl|window|document|process|require|module|exports|print|len|range|list|dict|tuple|set|str|int|float|bool|type|super|self)\b/;

const RULES_BY_LANG: Record<string, Rule[]> = {
  // JS / TS / JSX / TSX
  js: [
    { regex: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g,          type: "comment"    },
    { regex: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, type: "string" },
    { regex: JS_KEYWORDS,                                type: "keyword"    },
    { regex: TS_TYPES,                                   type: "type"       },
    { regex: BUILTINS,                                   type: "builtin"    },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g,              type: "type"       },
    { regex: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g, type: "function"   },
    { regex: /\b(\d+\.?\d*)\b/g,                        type: "number"     },
    { regex: /(=>|===|!==|==|!=|<=|>=|&&|\|\||\.\.\.|\?\?|[+\-*/%=<>!&|^~?:])/g, type: "operator" },
    { regex: /([{}()[\],;.])/g,                         type: "punctuation"},
  ],
  python: [
    { regex: /(#[^\n]*)/g,                               type: "comment"    },
    { regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, type: "string" },
    { regex: PY_KEYWORDS,                                type: "keyword"    },
    { regex: BUILTINS,                                   type: "builtin"    },
    { regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g,              type: "type"       },
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,   type: "function"   },
    { regex: /\b(\d+\.?\d*)\b/g,                        type: "number"     },
    { regex: /([+\-*/%=<>!&|^~:,.])/g,                  type: "operator"   },
  ],
  bash: [
    { regex: /(#[^\n]*)/g,                               type: "comment"    },
    { regex: /("(?:\\.|[^"\\])*"|'(?:[^'\\]|\\.)*')/g,  type: "string"     },
    { regex: /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|echo|export|local|readonly|source|cd|ls|grep|sed|awk|curl|wget|mkdir|rm|mv|cp|chmod|chown|sudo|apt|npm|npx|yarn|git|docker|kubectl)\b/g, type: "keyword" },
    { regex: /(\$[a-zA-Z_][a-zA-Z0-9_]*|\$\{[^}]+\}|\$\([^)]+\))/g, type: "builtin" },
    { regex: /\b(\d+)\b/g,                               type: "number"     },
    { regex: /([|&;<>])/g,                               type: "operator"   },
  ],
  json: [
    { regex: /("(?:\\.|[^"\\])*")\s*:/g,                type: "attribute"  },
    { regex: /:\s*("(?:\\.|[^"\\])*")/g,                type: "string"     },
    { regex: /\b(true|false|null)\b/g,                   type: "keyword"    },
    { regex: /\b(\d+\.?\d*)\b/g,                        type: "number"     },
    { regex: /([{}[\],:])/g,                             type: "punctuation"},
  ],
  html: [
    { regex: /(<!--[\s\S]*?-->)/g,                       type: "comment"    },
    { regex: /(<\/?)([a-zA-Z][a-zA-Z0-9-]*)/g,         type: "tag"        },
    { regex: /\s([a-zA-Z-]+)(?==)/g,                    type: "attribute"  },
    { regex: /("(?:\\.|[^"\\])*"|'(?:[^'\\]|\\.)*')/g,  type: "string"     },
    { regex: /([<>/=])/g,                                type: "punctuation"},
  ],
  css: [
    { regex: /(\/\*[\s\S]*?\*\/)/g,                     type: "comment"    },
    { regex: /("(?:\\.|[^"\\])*"|'(?:[^'\\]|\\.)*')/g,  type: "string"     },
    { regex: /([.#]?[a-zA-Z][a-zA-Z0-9_-]*)\s*\{/g,    type: "function"   },
    { regex: /([a-zA-Z-]+)\s*:/g,                       type: "attribute"  },
    { regex: /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/g, type: "string" },
    { regex: /\b(\d+\.?\d*)(px|em|rem|vh|vw|%|s|ms)?\b/g, type: "number"  },
  ],
  sql: [
    { regex: /(--[^\n]*|\/\*[\s\S]*?\*\/)/g,            type: "comment"    },
    { regex: /('(?:[^'\\]|\\.)*')/g,                    type: "string"     },
    { regex: /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|IN|LIKE|BETWEEN|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NULL|IS|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CASE|WHEN|THEN|ELSE|END)\b/gi, type: "keyword" },
    { regex: /\b(\d+\.?\d*)\b/g,                        type: "number"     },
  ],
};

// Aliases
RULES_BY_LANG.ts    = RULES_BY_LANG.js;
RULES_BY_LANG.tsx   = RULES_BY_LANG.js;
RULES_BY_LANG.jsx   = RULES_BY_LANG.js;
RULES_BY_LANG.sh    = RULES_BY_LANG.bash;
RULES_BY_LANG.zsh   = RULES_BY_LANG.bash;
RULES_BY_LANG.go    = RULES_BY_LANG.js;
RULES_BY_LANG.rust  = RULES_BY_LANG.js;
RULES_BY_LANG.java  = RULES_BY_LANG.js;
RULES_BY_LANG.kotlin= RULES_BY_LANG.js;
RULES_BY_LANG.swift = RULES_BY_LANG.js;
RULES_BY_LANG.yaml  = RULES_BY_LANG.json;
RULES_BY_LANG.yml   = RULES_BY_LANG.json;

// ── Tokenizer ──────────────────────────────────────────────────────────────────
function tokenize(code: string, lang: string): Token[] {
  const rules = RULES_BY_LANG[lang.toLowerCase()] ?? [];
  if (rules.length === 0) return [{ type: "plain", value: code }];

  // Build a map of [start, end] → TokenType from all rules
  const spans: Array<{ start: number; end: number; type: TokenType }> = [];

  for (const rule of rules) {
    const regex = new RegExp(rule.regex.source, rule.regex.flags.includes("g") ? rule.regex.flags : rule.regex.flags + "g");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(code)) !== null) {
      // Use first capture group if present, else full match
      const val = match[1] ?? match[0];
      const start = match.index + (match[1] ? match[0].indexOf(val) : 0);
      const end = start + val.length;
      spans.push({ start, end, type: rule.type });
    }
  }

  // Sort by start, resolve overlaps (first wins)
  spans.sort((a, b) => a.start - b.start);

  const tokens: Token[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (span.start < cursor) continue; // already covered
    if (span.start > cursor) {
      tokens.push({ type: "plain", value: code.slice(cursor, span.start) });
    }
    tokens.push({ type: span.type, value: code.slice(span.start, span.end) });
    cursor = span.end;
  }

  if (cursor < code.length) {
    tokens.push({ type: "plain", value: code.slice(cursor) });
  }

  return tokens;
}

// ── Component ──────────────────────────────────────────────────────────────────
interface Props {
  code: string;
  language?: string;
}

export function SyntaxHighlighter({ code, language = "plain" }: Props) {
  const tokens = useMemo(() => tokenize(code, language), [code, language]);

  return (
    <View>
      <Text style={hlStyles.base} selectable>
        {tokens.map((tok, i) => (
          <Text key={i} style={{ color: TOKEN_COLORS[tok.type] }}>
            {tok.value}
          </Text>
        ))}
      </Text>
    </View>
  );
}

const hlStyles = StyleSheet.create({
  base: {
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
});