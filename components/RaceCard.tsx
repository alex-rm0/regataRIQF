import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface RaceEntry {
  id: string;
  lane: number;
  clubName: string;
  clubAbbr: string | null;
  crewNames: string | null;
  resultTime: string | null;
  position: number | null;
  status: string | null;
}

interface RaceCardProps {
  raceNumber: number;
  time: string;
  category: string;
  gender: string;
  boatType: string;
  distance: number;
  phase: string;
  entries: RaceEntry[];
  showResults?: boolean;
}

function getPositionColor(pos: number): string {
  if (pos === 1) return "#FFD700";
  if (pos === 2) return "#C0C0C0";
  if (pos === 3) return "#CD7F32";
  return Colors.textSecondary;
}

function getGenderLabel(g: string): string {
  if (g === "M") return "Masculino";
  if (g === "F") return "Feminino";
  return g;
}

function getGenderShort(g: string): string {
  if (g === "Masculino") return "M";
  if (g === "Feminino") return "F";
  return g.charAt(0);
}

export function RaceCard({ raceNumber, time, category, gender, boatType, distance, phase, entries, showResults }: RaceCardProps) {
  const sortedEntries = showResults
    ? [...entries].sort((a, b) => {
        if (a.position && b.position) return a.position - b.position;
        if (a.position) return -1;
        if (b.position) return 1;
        return a.lane - b.lane;
      })
    : entries;

  const hasResults = entries.some((e) => e.resultTime);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.raceNumberBadge}>
            <Text style={styles.raceNumberText}>{raceNumber}</Text>
          </View>
          <View>
            <Text style={styles.timeText}>{time}</Text>
            <Text style={styles.phaseText}>{phase}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <View style={[styles.genderBadge, (gender === "F" || gender === "Feminino") ? styles.genderF : styles.genderM]}>
            <Text style={styles.genderText}>{getGenderShort(gender)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="boat" size={14} color={Colors.primaryLight} />
          <Text style={styles.infoText}>{boatType}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="resize" size={14} color={Colors.primaryLight} />
          <Text style={styles.infoText}>{distance}m</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person" size={14} color={Colors.primaryLight} />
          <Text style={styles.infoText}>{getGenderLabel(gender)}</Text>
        </View>
      </View>

      {sortedEntries.length > 0 && (
        <View style={styles.entriesContainer}>
          <View style={styles.entriesHeader}>
            <Text style={[styles.entryHeaderText, { flex: 0.3 }]}>
              {showResults && hasResults ? "Pos" : "Pista"}
            </Text>
            <Text style={[styles.entryHeaderText, { flex: 1 }]}>Clube</Text>
            {showResults && hasResults && (
              <Text style={[styles.entryHeaderText, { flex: 0.5, textAlign: "right" as const }]}>Tempo</Text>
            )}
          </View>
          {sortedEntries.map((entry) => (
            <View key={entry.id} style={styles.entryBlock}>
              <View style={styles.entryRow}>
                <View style={[styles.entryLane, { flex: 0.3 }]}>
                  {showResults && entry.position ? (
                    <View style={[styles.positionBadge, { backgroundColor: getPositionColor(entry.position) }]}>
                      <Text style={styles.positionText}>{entry.position}</Text>
                    </View>
                  ) : (
                    <Text style={styles.laneText}>{entry.lane}</Text>
                  )}
                </View>
                <Text style={[styles.clubText, { flex: 1 }]} numberOfLines={1}>
                  {entry.clubAbbr ? `${entry.clubAbbr} - ` : ""}{entry.clubName}
                </Text>
                {showResults && hasResults && (
                  <Text style={[styles.timeResultText, { flex: 0.5, textAlign: "right" as const }]}>
                    {entry.resultTime || (entry.status === "DNS" ? "DNS" : entry.status === "DNF" ? "DNF" : "-")}
                  </Text>
                )}
              </View>
              {entry.crewNames ? (
                <Text style={styles.crewText} numberOfLines={2}>{entry.crewNames}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.primary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  raceNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  raceNumberText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: Colors.white,
  },
  timeText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  phaseText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: Colors.textOnDarkMuted,
  },
  headerRight: {
    flexDirection: "row",
    gap: 6,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  categoryText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: Colors.white,
  },
  genderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  genderM: {
    backgroundColor: "#3498DB",
  },
  genderF: {
    backgroundColor: "#E91E8A",
  },
  genderText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 12,
    color: Colors.white,
  },
  infoRow: {
    flexDirection: "row",
    padding: 10,
    paddingHorizontal: 14,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  entriesContainer: {
    padding: 12,
    paddingHorizontal: 14,
  },
  entriesHeader: {
    flexDirection: "row",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  entryHeaderText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  entryBlock: {
    paddingVertical: 4,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 2,
  },
  entryLane: {
    alignItems: "flex-start",
  },
  laneText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: Colors.primary,
    width: 24,
    textAlign: "center",
  },
  clubText: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 13,
    color: Colors.textPrimary,
  },
  positionBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 12,
    color: Colors.white,
  },
  timeResultText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
  crewText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 36,
    marginTop: 1,
  },
});
