import React from "react";
import {
  StyleSheet, Text, View, ScrollView, Pressable,
  Platform, Dimensions, ImageBackground,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAdmin } from "@/lib/admin-context";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAdmin } = useAdmin();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={require("@/assets/images/poster.png")}
            style={styles.posterImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(26,58,74,0.85)", Colors.primary]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroContent, { paddingTop: topInset + 10 }]}>
            <Text style={styles.heroEdition}>XLIII</Text>
            <Text style={styles.heroTitle}>Regata Internacional</Text>
            <Text style={styles.heroSubtitle}>Queima das Fitas</Text>
            <View style={styles.dateBadge}>
              <Ionicons name="calendar" size={16} color={Colors.accent} />
              <Text style={styles.dateText}>2 de Maio de 2026</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color={Colors.accent} />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>Local</Text>
              <Text style={styles.infoValue}>Parque Verde do Mondego, Coimbra</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Programa do Dia</Text>
          <View style={styles.scheduleContainer}>
            <ScheduleItem time="09:30" title="Remo Jovem" icon="boat" />
            <View style={styles.scheduleLine} />
            <ScheduleItem time="16:00" title="Finais" icon="trophy" />
            <View style={styles.scheduleLine} />
            <ScheduleItem time="17:15" title="Memorial Jose Matos" icon="ribbon" />
          </View>

          <Text style={styles.sectionTitle}>Acesso Rapido</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="list"
              label="Programa"
              onPress={() => router.push("/(tabs)/program")}
            />
            <QuickAction
              icon="trophy"
              label="Resultados"
              onPress={() => router.push("/(tabs)/results")}
            />
            <QuickAction
              icon="notifications"
              label="Avisos"
              onPress={() => router.push("/(tabs)/notifications")}
            />
            <QuickAction
              icon="mail"
              label="Contacto"
              onPress={() => router.push("/(tabs)/contact")}
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.adminButton, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/admin")}
          >
            <Ionicons name="settings" size={18} color={Colors.textOnDarkMuted} />
            <Text style={styles.adminButtonText}>
              {isAdmin ? "Painel Admin" : "Acesso Admin"}
            </Text>
          </Pressable>

          <View style={styles.orgSection}>
            <Text style={styles.orgTitle}>Organizacao</Text>
            <Text style={styles.orgText}>
              Seccao de Desportos Nauticos{"\n"}
              Associacao Academica de Coimbra
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ScheduleItem({ time, title, icon }: { time: string; title: string; icon: string }) {
  return (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleDot}>
        <Ionicons name={icon as any} size={16} color={Colors.white} />
      </View>
      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleTime}>{time}</Text>
        <Text style={styles.scheduleTitle}>{title}</Text>
      </View>
    </View>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && { transform: [{ scale: 0.96 }] }]}
    >
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={24} color={Colors.accent} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  heroContainer: {
    height: 420,
    width: "100%",
    position: "relative",
  },
  posterImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroContent: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
  },
  heroEdition: {
    fontFamily: "Montserrat_800ExtraBold",
    fontSize: 28,
    color: Colors.accent,
    marginBottom: 2,
  },
  heroTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: Colors.white,
  },
  heroSubtitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 18,
    color: Colors.accentLight,
    marginBottom: 10,
  },
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  content: {
    backgroundColor: Colors.offWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212,168,67,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextBlock: {
    flex: 1,
  },
  infoLabel: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  scheduleContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scheduleDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  scheduleLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.border,
    marginLeft: 17,
    marginVertical: 2,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTime: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: Colors.accent,
  },
  scheduleTitle: {
    fontFamily: "Montserrat_500Medium",
    fontSize: 14,
    color: Colors.textPrimary,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(212,168,67,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 11,
    color: Colors.textPrimary,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
  },
  adminButtonText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: Colors.textOnDarkMuted,
  },
  orgSection: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 20,
  },
  orgTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  orgText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
