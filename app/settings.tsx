import React from "react";
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@/components/AppIcons";
import { router } from "expo-router";
import { useAdmin } from "@/lib/admin-context";
import Colors from "@/constants/colors";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin, logout } = useAdmin();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Definicoes</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomInset + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Administracao</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
            onPress={() => router.push("/admin")}
          >
            <View style={[styles.menuIcon, { backgroundColor: "rgba(212,168,67,0.12)" }]}>
              <Ionicons name="shield" size={20} color={Colors.accent} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                {isAdmin ? "Painel de Administracao" : "Acesso Administrador"}
              </Text>
              <Text style={styles.menuSubtitle}>
                {isAdmin ? "Gerir provas, resultados e avisos" : "Iniciar sessao como administrador"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
          </Pressable>
          {isAdmin && (
            <Pressable
              style={({ pressed }) => [styles.menuItem, styles.menuItemBorder, pressed && { opacity: 0.7 }]}
              onPress={() => {
                logout();
                router.back();
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: "rgba(231,76,60,0.1)" }]}>
                <Ionicons name="log-out" size={20} color={Colors.danger} />
              </View>
              <View style={styles.menuContent}>
                <Text style={[styles.menuTitle, { color: Colors.danger }]}>Terminar Sessao</Text>
                <Text style={styles.menuSubtitle}>Sair do modo administrador</Text>
              </View>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionLabel}>Sobre</Text>
        <View style={styles.card}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIcon, { backgroundColor: "rgba(26,58,74,0.1)" }]}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Sobre a App</Text>
              <Text style={styles.menuSubtitle}>Versao 1.0.0</Text>
            </View>
          </View>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: "rgba(26,58,74,0.1)" }]}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Organizacao</Text>
              <Text style={styles.menuSubtitle}>Seccao de Desportos Nauticos - AAC</Text>
            </View>
          </View>
          <View style={[styles.menuItem, styles.menuItemBorder]}>
            <View style={[styles.menuIcon, { backgroundColor: "rgba(26,58,74,0.1)" }]}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Evento</Text>
              <Text style={styles.menuSubtitle}>XLIII Regata Internacional Queima das Fitas 2026</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: Colors.white,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionLabel: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 12,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
  },
  menuSubtitle: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
