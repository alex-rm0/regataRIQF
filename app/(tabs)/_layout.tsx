import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@/components/AppIcons";
import { Platform, StyleSheet, View, Text } from "react-native";
import { BlurView } from "expo-blur";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";

export default function TabLayout() {
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count || 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          position: "absolute" as const,
          backgroundColor: Platform.select({
            ios: "transparent",
            android: Colors.primary,
            web: Colors.primary,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "web" ? 84 : 88,
          paddingBottom: Platform.OS === "web" ? 34 : 30,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Montserrat_500Medium",
          fontSize: 10,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={95}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: Colors.primary }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Evento",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="rowing" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="program"
        options={{
          title: "Provas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Resultados",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Avisos",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Ionicons name="notifications" size={size} color={color} />
              {unreadCount > 0 && (
                <View style={{
                  position: "absolute" as const,
                  top: -4,
                  right: -8,
                  backgroundColor: Colors.danger,
                  borderRadius: 9,
                  minWidth: 18,
                  height: 18,
                  alignItems: "center" as const,
                  justifyContent: "center" as const,
                  paddingHorizontal: 4,
                }}>
                  <Text style={{
                    fontFamily: "Montserrat_700Bold",
                    fontSize: 10,
                    color: "#fff",
                  }}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: "Contacto",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
