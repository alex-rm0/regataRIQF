import React from "react";
import { Platform, Text, TextStyle } from "react-native";
import {
  Ionicons as ExpoIonicons,
  MaterialCommunityIcons as ExpoMaterialCommunityIcons,
  Feather as ExpoFeather,
} from "@expo/vector-icons";

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  style?: TextStyle;
};

const ioniconFallbacks: Record<string, string> = {
  "add": "+",
  "add-circle": "+",
  "alert-circle": "!",
  "arrow-back": "←",
  "boat": "🚣",
  "boat-outline": "🚣",
  "calendar": "📅",
  "checkmark": "✓",
  "checkmark-circle": "✓",
  "chevron-down": "⌄",
  "chevron-forward": "›",
  "chevron-up": "⌃",
  "close": "✕",
  "cloud-upload": "⇪",
  "filter": "⛃",
  "information-circle": "i",
  "list": "☰",
  "location": "📍",
  "lock-closed": "🔒",
  "log-out": "⇠",
  "mail": "@",
  "megaphone": "📣",
  "musical-notes": "♪",
  "notifications": "🔔",
  "notifications-off-outline": "🔕",
  "people": "👥",
  "pencil": "✎",
  "person": "👤",
  "podium": "🏁",
  "resize": "⤢",
  "restaurant": "🍽",
  "ribbon": "🎗",
  "send": "➤",
  "settings-outline": "⚙",
  "shield": "🛡",
  "star": "★",
  "time": "🕒",
  "trash": "🗑",
  "trophy": "🏆",
  "trophy-outline": "🏆",
  "warning": "⚠",
  "water": "💧",
  "fitness": "💪",
  "bicycle": "🚲",
  "flag": "⚑",
  "gift": "🎁",
  "medal": "🏅",
};

const materialFallbacks: Record<string, string> = {
  "rowing": "🚣",
};

const featherFallbacks: Record<string, string> = {
  "alert-circle": "!",
  "x": "✕",
};

function FallbackIcon({
  glyph,
  size = 16,
  color = "#000",
  style,
}: {
  glyph: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}) {
  return (
    <Text
      selectable={false}
      style={[
        {
          fontSize: size,
          lineHeight: size,
          color,
          fontWeight: "700",
          textAlign: "center",
          includeFontPadding: false,
        },
        style,
      ]}
    >
      {glyph}
    </Text>
  );
}

export function Ionicons({ name, ...props }: IconProps) {
  if (Platform.OS === "web") {
    return <FallbackIcon glyph={ioniconFallbacks[name] ?? "o"} {...props} />;
  }

  return <ExpoIonicons name={name as any} {...props} />;
}

export function MaterialCommunityIcons({ name, ...props }: IconProps) {
  if (Platform.OS === "web") {
    return <FallbackIcon glyph={materialFallbacks[name] ?? "o"} {...props} />;
  }

  return <ExpoMaterialCommunityIcons name={name as any} {...props} />;
}

export function Feather({ name, ...props }: IconProps) {
  if (Platform.OS === "web") {
    return <FallbackIcon glyph={featherFallbacks[name] ?? "o"} {...props} />;
  }

  return <ExpoFeather name={name as any} {...props} />;
}
