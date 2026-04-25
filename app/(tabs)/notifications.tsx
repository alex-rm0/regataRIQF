import React from "react";
import {
  StyleSheet, Text, View, FlatList, Platform, ActivityIndicator, Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@/components/AppIcons";
import Colors from "@/constants/colors";
import { apiRequest, queryClient } from "@/lib/query-client";
import { TAB_BAR_CONTENT_PADDING } from "@/constants/layout";

function getTypeConfig(type: string) {
  switch (type) {
    case "urgent":
      return { icon: "alert-circle" as const, color: Colors.danger, bg: "rgba(231,76,60,0.1)", label: "Urgente" };
    case "warning":
      return { icon: "warning" as const, color: Colors.warning, bg: "rgba(243,156,18,0.1)", label: "Aviso" };
    case "schedule":
      return { icon: "time" as const, color: Colors.info, bg: "rgba(52,152,219,0.1)", label: "Horário" };
    default:
      return { icon: "information-circle" as const, color: Colors.primaryLight, bg: "rgba(42,90,106,0.1)", label: "Info" };
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${day}/${month} - ${hours}:${mins}`;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const { data: notifications = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>Avisos</Text>
        <Text style={styles.headerSubtitle}>
          {notifications.length} {notifications.length === 1 ? "aviso" : "avisos"}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>Sem avisos</Text>
          <Text style={styles.emptyText}>
            Quando a organização publicar avisos, eles vão aparecer aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }: any) => {
            const config = getTypeConfig(item.type);
            const isUnread = !item.read;
            return (
              <Pressable
                style={[styles.notifCard, isUnread && styles.notifCardUnread]}
                onPress={async () => {
                  if (isUnread) {
                    await apiRequest("PUT", `/api/notifications/${item.id}/read`);
                    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
                  }
                }}
              >
                <View style={[styles.notifIconContainer, { backgroundColor: config.bg }]}>
                  <Ionicons name={config.icon} size={22} color={config.color} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifTopRow}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                      <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                  <View style={styles.notifBottomRow}>
                    {item.createdAt && (
                      <Text style={styles.notifTime}>{formatDate(item.createdAt)}</Text>
                    )}
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                </View>
              </Pressable>
            );
          }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: TAB_BAR_CONTENT_PADDING }}
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
  notifCard: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  notifIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 6,
  },
  typeText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 10,
    textTransform: "uppercase",
  },
  notifMessage: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  notifTime: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 11,
    color: Colors.textLight,
  },
  notifCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  notifBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
});
