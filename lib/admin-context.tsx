import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

interface AdminContextValue {
  isAdmin: boolean;
  adminUsername: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => string;
  credentials: { username: string; password: string } | null;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const STORE_KEY = "admin_credentials";

async function storeCredentials(username: string, password: string) {
  const val = JSON.stringify({ username, password });
  if (Platform.OS === "web") {
    localStorage.setItem(STORE_KEY, val);
  } else {
    await SecureStore.setItemAsync(STORE_KEY, val);
  }
}

async function getStoredCredentials(): Promise<{ username: string; password: string } | null> {
  try {
    let val: string | null;
    if (Platform.OS === "web") {
      val = localStorage.getItem(STORE_KEY);
    } else {
      val = await SecureStore.getItemAsync(STORE_KEY);
    }
    if (val) return JSON.parse(val);
  } catch {}
  return null;
}

async function clearCredentials() {
  if (Platform.OS === "web") {
    localStorage.removeItem(STORE_KEY);
  } else {
    await SecureStore.deleteItemAsync(STORE_KEY);
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);

  useEffect(() => {
    getStoredCredentials().then((creds) => {
      if (creds) setCredentials(creds);
    });
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const { apiRequest } = await import("@/lib/query-client");
    try {
      await apiRequest("POST", "/api/admin/login", { username, password });
      await storeCredentials(username, password);
      setCredentials({ username, password });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearCredentials();
    setCredentials(null);
  };

  const getAuthHeader = () => {
    if (!credentials) return "";
    return "Basic " + btoa(`${credentials.username}:${credentials.password}`);
  };

  const value = useMemo(() => ({
    isAdmin: !!credentials,
    adminUsername: credentials?.username ?? null,
    login,
    logout,
    getAuthHeader,
    credentials,
  }), [credentials]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
