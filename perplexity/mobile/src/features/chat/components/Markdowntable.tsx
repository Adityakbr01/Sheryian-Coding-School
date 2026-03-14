/**
 * MarkdownTable.tsx
 *
 * Renders markdown tables as proper RN Views.
 * Supports horizontal scroll for wide tables.
 */

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

interface Props {
  header: string[];
  rows: string[][];
}

export function MarkdownTable({ header, rows }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.wrapper}
    >
      <View style={styles.table}>
        {/* Header */}
        <View style={[styles.row, styles.headerRow]}>
          {header.map((cell, i) => (
            <View key={i} style={[styles.cell, styles.headerCell]}>
              <Text style={styles.headerText}>{cell.trim()}</Text>
            </View>
          ))}
        </View>

        {/* Body */}
        {rows.map((row, ri) => (
          <View
            key={ri}
            style={[styles.row, ri % 2 === 1 && styles.altRow]}
          >
            {row.map((cell, ci) => (
              <View key={ci} style={styles.cell}>
                <Text style={styles.cellText}>{cell.trim()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  table: {
    overflow: "hidden",
    borderRadius: 10,
    minWidth: "100%",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  headerRow: {
    backgroundColor: "#1e1e1e",
  },
  altRow: {
    backgroundColor: "#161616",
  },
  cell: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 90,
    borderRightWidth: 1,
    borderRightColor: "#222",
    justifyContent: "center",
  },
  headerCell: {
    backgroundColor: "transparent",
  },
  headerText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  cellText: {
    color: "#d4d4d4",
    fontSize: 13,
    lineHeight: 18,
  },
});