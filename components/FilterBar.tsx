import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface FilterBarProps {
  label: string;
  options: readonly string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}

export function FilterBar({ label, options, selected, onSelect }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Pressable
          onPress={() => onSelect(null)}
          style={[styles.chip, !selected && styles.chipActive]}
        >
          <Text style={[styles.chipText, !selected && styles.chipTextActive]}>Todos</Text>
        </Pressable>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onSelect(opt === selected ? null : opt)}
            style={[styles.chip, selected === opt && styles.chipActive]}
          >
            <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>{opt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  label: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scroll: {
    gap: 6,
    paddingRight: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
    fontFamily: "Montserrat_600SemiBold",
  },
});
