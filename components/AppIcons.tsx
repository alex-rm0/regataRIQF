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
  "arrow-back": "<",
  "boat": "B",
  "boat-outline": "B",
  "calendar": "C",
  "checkmark": "V",
  "checkmark-circle": "V",
  "chevron-down": "v",
  "chevron-forward": ">",
  "chevron-up": "^",
  "close": "x",
  "cloud-upload": "^",
  "filter": "=",
  "information-circle": "i",
  "list": "=",
  "location": "o",
  "lock-closed": "*",
  "log-out": "-",
  "mail": "@",
  "megaphone": "!",
  "musical-notes": "*",
  "notifications": "!",
  "notifications-off-outline": "!",
  "people": "P",
  "pencil": "/",
  "person": "P",
  "podium": "#",
  "resize": "#",
  "restaurant": "*",
  "ribbon": "~",
  "send": ">",
  "settings-outline": "s",
  "shield": "#",
  "star": "*",
  "time": "o",
  "trash": "x",
  "trophy": "T",
  "trophy-outline": "T",
  "warning": "!",
  "water": "~",
  "fitness": "F",
  "bicycle": "B",
  "flag": "F",
  "gift": "G",
  "medal": "M",
};

const materialFallbacks: Record<string, string> = {
  "rowing": "R",
};

const featherFallbacks: Record<string, string> = {
  "alert-circle": "!",
  "x": "x",
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
