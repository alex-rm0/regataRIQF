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
import { TAB_BAR_CONTENT_PADDING } from "@/constants/layout";

export default function ProgramScreen() {
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

  const filteredRaces = useMemo(() => {
    return races.filter((race: any) => {
      if (categoryFilter && race.category !== categoryFilter) return false;
      if (genderFilter && race.gender !== genderFilter) return false;
      if (boatFilter && race.boatType !== boatFilter) return false;
      return true;
    });
  }, [races, categoryFilter, genderFilter, boatFilter]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>Programa de Provas</Text>
        <Text style={styles.headerSubtitle}>
          {filteredRaces.length} {filteredRaces.length === 1 ? "prova" : "provas"}
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
          <FilterBar label="Escalão" options={CATEGORIES} selected={categoryFilter} onSelect={setCategoryFilter} />
          <FilterBar label="Género" options={GENDERS} selected={genderFilter} onSelect={setGenderFilter} />
          <FilterBar label="Embarcação" options={BOAT_TYPES} selected={boatFilter} onSelect={setBoatFilter} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : filteredRaces.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="boat-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Sem provas</Text>
          <Text style={styles.emptyText}>
            {races.length === 0
              ? "O programa ainda nao foi publicado."
              : "Nenhuma prova corresponde aos filtros selecionados."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRaces}
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
            />
          )}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: TAB_BAR_CONTENT_PADDING }}
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
