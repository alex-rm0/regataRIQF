import React, { useState, useMemo } from "react";
import {
  StyleSheet, Text, View, FlatList, Platform, ActivityIndicator, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@/components/AppIcons";
import { FilterBar } from "@/components/FilterBar";
import { RaceCard } from "@/components/RaceCard";
import Colors from "@/constants/colors";
import { CATEGORIES, GENDERS, BOAT_TYPES } from "@shared/schema";

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);
  const [boatFilter, setBoatFilter] = useState<string | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const activeFilterCount = [categoryFilter, genderFilter, boatFilter].filter(Boolean).length;

  const { data: races = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/races"],
  });

  const racesWithResults = useMemo(() => {
    return races.filter((race: any) => {
      const hasResults = race.entries?.some((e: any) => e.resultTime);
      if (!hasResults) return false;
      if (categoryFilter && race.category !== categoryFilter) return false;
      if (genderFilter && race.gender !== genderFilter) return false;
      if (boatFilter && race.boatType !== boatFilter) return false;
      return true;
    });
  }, [races, categoryFilter, genderFilter, boatFilter]);

  const totalWithResults = races.filter((r: any) => r.entries?.some((e: any) => e.resultTime)).length;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>Resultados</Text>
        <Text style={styles.headerSubtitle}>
          {totalWithResults} {totalWithResults === 1 ? "prova concluida" : "provas concluidas"}
        </Text>
      </View>

      <Pressable 
        style={styles.filterToggle}
        onPress={() => setFiltersExpanded(!filtersExpanded)}
      >
        <View style={styles.filterToggleLeft}>
          <Ionicons name="filter" size={16} color={Colors.primary} />
          <Text style={styles.filterToggleText}>Filtros</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>
        <Ionicons name={filtersExpanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.textSecondary} />
      </Pressable>

      {filtersExpanded && (
        <View style={styles.filtersContainer}>
          <FilterBar label="Escalao" options={CATEGORIES} selected={categoryFilter} onSelect={setCategoryFilter} />
          <FilterBar label="Sexo" options={GENDERS} selected={genderFilter} onSelect={setGenderFilter} />
          <FilterBar label="Embarcacao" options={BOAT_TYPES} selected={boatFilter} onSelect={setBoatFilter} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : racesWithResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Sem resultados</Text>
          <Text style={styles.emptyText}>
            {totalWithResults === 0
              ? "Os resultados serao publicados apos a conclusao das provas."
              : "Nenhum resultado corresponde aos filtros selecionados."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={racesWithResults}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => (
            <RaceCard
              raceNumber={item.raceNumber}
              time={item.time}
              category={item.category}
              gender={item.gender}
              boatType={item.boatType}
              distance={item.distance}
              phase={item.phase}
              entries={item.entries || []}
              showResults
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 24,
    color: Colors.white,
  },
  headerSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: Colors.textOnDarkMuted,
    marginTop: 2,
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterToggleText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  filterBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 11,
    color: Colors.white,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
  },
});
