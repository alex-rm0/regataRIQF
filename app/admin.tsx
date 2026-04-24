import React, { useState } from "react";
import {
  StyleSheet, Text, View, TextInput, Pressable, ScrollView,
  Platform, Alert, ActivityIndicator, Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAdmin } from "@/lib/admin-context";
import { apiRequest } from "@/lib/query-client";
import { queryClient } from "@/lib/query-client";
import Colors from "@/constants/colors";
import {
  CATEGORIES, GENDERS, BOAT_TYPES, PHASES, SCHEDULE_ICONS,
} from "@shared/schema";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;
  const { isAdmin, login, logout, getAuthHeader } = useAdmin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"races" | "results" | "notifs" | "messages" | "import" | "schedule">("races");
  const [showRaceModal, setShowRaceModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);

  const [raceForm, setRaceForm] = useState({
    raceNumber: "", time: "", category: CATEGORIES[0], gender: GENDERS[0],
    boatType: BOAT_TYPES[0], distance: "500", phase: PHASES[0],
  });

  const [importJson, setImportJson] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [clearOnImport, setClearOnImport] = useState(true);

  const [entryForm, setEntryForm] = useState({
    lane: "", clubName: "",
  });

  const [notifForm, setNotifForm] = useState({
    title: "", message: "", type: "info",
  });

  const [scheduleForm, setScheduleForm] = useState({
    time: "", title: "", icon: "time",
  });

  const { data: races = [], refetch: refetchRaces } = useQuery<any[]>({ queryKey: ["/api/races"] });
  const { data: notifications = [], refetch: refetchNotifs } = useQuery<any[]>({ queryKey: ["/api/notifications"] });
  const { data: scheduleItems = [] } = useQuery<any[]>({ queryKey: ["/api/schedule"] });
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ["/api/contacts"],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/contacts", undefined, { Authorization: getAuthHeader() });
      return res.json();
    },
  });

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    const loginResult = await login(username, password);
    if (loginResult) setLoginError(loginResult);
    else if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setLoginLoading(false);
  };

  const authHeaders = () => ({ Authorization: getAuthHeader() });

  const addRace = async () => {
    await apiRequest("POST", "/api/races", {
      raceNumber: parseInt(raceForm.raceNumber),
      time: raceForm.time,
      category: raceForm.category,
      gender: raceForm.gender,
      boatType: raceForm.boatType,
      distance: parseInt(raceForm.distance),
      phase: raceForm.phase,
    }, authHeaders());
    setShowRaceModal(false);
    setRaceForm({ raceNumber: "", time: "", category: CATEGORIES[0], gender: GENDERS[0], boatType: BOAT_TYPES[0], distance: "500", phase: PHASES[0] });
    queryClient.invalidateQueries({ queryKey: ["/api/races"] });
  };

  const addEntry = async () => {
    if (!selectedRace) return;
    await apiRequest("POST", `/api/races/${selectedRace.id}/entries`, {
      lane: parseInt(entryForm.lane),
      clubName: entryForm.clubName,
    }, authHeaders());
    setEntryForm({ lane: "", clubName: "" });
    queryClient.invalidateQueries({ queryKey: ["/api/races"] });
  };

  const deleteRace = async (id: string) => {
    await apiRequest("DELETE", `/api/races/${id}`, undefined, authHeaders());
    queryClient.invalidateQueries({ queryKey: ["/api/races"] });
  };

  const addNotif = async () => {
    await apiRequest("POST", "/api/notifications", notifForm, authHeaders());
    setShowNotifModal(false);
    setNotifForm({ title: "", message: "", type: "info" });
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const deleteNotif = async (id: string) => {
    await apiRequest("DELETE", `/api/notifications/${id}`, undefined, authHeaders());
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  };

  const handleImport = async () => {
    setImportLoading(true);
    setImportResult(null);
    try {
      const parsed = JSON.parse(importJson);
      const racesArray = parsed.races || parsed;
      if (!Array.isArray(racesArray)) {
        setImportResult("Erro: o JSON deve conter um array 'races' ou ser um array de provas.");
        setImportLoading(false);
        return;
      }
      const res = await apiRequest("POST", "/api/import", {
        races: racesArray,
        clearExisting: clearOnImport,
      }, authHeaders());
      const data = await res.json();
      setImportResult(`Importacao concluida: ${data.racesCreated} provas e ${data.entriesCreated} inscricoes criadas.`);
      setImportJson("");
      queryClient.invalidateQueries({ queryKey: ["/api/races"] });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setImportResult(`Erro: ${err.message}`);
    }
    setImportLoading(false);
  };

  const [resultEntries, setResultEntries] = useState<any[]>([]);

  const openResultsFor = (race: any) => {
    setSelectedRace(race);
    setResultEntries(
      (race.entries || []).map((e: any) => ({
        id: e.id,
        lane: e.lane,
        clubName: e.clubName,
        resultTime: e.resultTime || "",
        status: e.status || "DNS",
      }))
    );
    setShowResultModal(true);
  };

  const formatTimeInput = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, "").slice(0, 7);
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) {
      const secs = digits.slice(0, -2);
      const hundredths = digits.slice(-2);
      return `${secs}.${hundredths}`;
    }
    const hundredths = digits.slice(-2);
    const remaining = digits.slice(0, -2);
    const secs = remaining.slice(-2);
    const mins = remaining.slice(0, -2);
    return `${mins}:${secs}.${hundredths}`;
  };

  const parseTimeToMs = (timeStr: string): number | null => {
    try {
      const parts = timeStr.split(":");
      if (parts.length === 2) {
        const minutes = parseInt(parts[0]);
        const secParts = parts[1].split(".");
        const seconds = parseInt(secParts[0]);
        const ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, "0").slice(0, 3)) : 0;
        return minutes * 60000 + seconds * 1000 + ms;
      } else if (parts.length === 1) {
        const secParts = timeStr.split(".");
        const seconds = parseInt(secParts[0]);
        const ms = secParts.length > 1 ? parseInt(secParts[1].padEnd(3, "0").slice(0, 3)) : 0;
        return seconds * 1000 + ms;
      }
      return null;
    } catch { return null; }
  };

  const saveResults = async () => {
    if (!selectedRace) return;
    const entriesWithTime = resultEntries
      .map((e) => ({
        ...e,
        parsedTime: e.resultTime ? parseTimeToMs(e.resultTime) : null,
      }))
      .filter((e) => e.parsedTime !== null && e.status !== "DNS" && e.status !== "DNF" && e.status !== "DSQ");
    
    entriesWithTime.sort((a, b) => (a.parsedTime || 0) - (b.parsedTime || 0));
    
    const positionMap: Record<string, number> = {};
    entriesWithTime.forEach((e, idx) => {
      positionMap[e.id] = idx + 1;
    });

    const results = resultEntries.map((e) => ({
      id: e.id,
      resultTime: e.resultTime || null,
      position: positionMap[e.id] || null,
      status: e.resultTime ? "FIN" : e.status,
    }));
    await apiRequest("PUT", `/api/races/${selectedRace.id}/results`, { results }, authHeaders());
    setShowResultModal(false);
    queryClient.invalidateQueries({ queryKey: ["/api/races"] });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatScheduleTime = (raw: string): string => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return digits;
    const hours = digits.slice(0, 2);
    const mins = digits.slice(2, 4);
    return `${hours}:${mins}`;
  };

  const openScheduleModal = (item?: any) => {
    if (item) {
      setEditingSchedule(item);
      setScheduleForm({
        time: item.time,
        title: item.title,
        icon: item.icon,
      });
    } else {
      setEditingSchedule(null);
      setScheduleForm({ time: "", title: "", icon: "time" });
    }
    setShowScheduleModal(true);
  };

  const saveScheduleEntry = async () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(scheduleForm.time)) {
      Alert.alert("Formato invalido", "A hora deve estar no formato HH:MM (ex: 09:30)");
      return;
    }
    const payload = {
      time: scheduleForm.time,
      title: scheduleForm.title,
      icon: scheduleForm.icon,
      sortOrder: 0,
    };
    if (editingSchedule) {
      await apiRequest("PUT", `/api/schedule/${editingSchedule.id}`, payload, authHeaders());
    } else {
      await apiRequest("POST", "/api/schedule", payload, authHeaders());
    }
    setShowScheduleModal(false);
    queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteScheduleEntry = async (id: string) => {
    await apiRequest("DELETE", `/api/schedule/${id}`, undefined, authHeaders());
    queryClient.invalidateQueries({ queryKey: ["/api/schedule"] });
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={[styles.loginHeader, { paddingTop: topInset + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.loginTitle}>Acesso Admin</Text>
        </View>
        <View style={styles.loginContainer}>
          <View style={styles.loginIcon}>
            <Ionicons name="lock-closed" size={48} color={Colors.accent} />
          </View>
          <Text style={styles.loginSubtitle}>Acesso reservado a organizacao</Text>
          {loginError ? <Text style={styles.loginError}>{loginError}</Text> : null}
          <TextInput
            style={styles.loginInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Utilizador"
            placeholderTextColor={Colors.textLight}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.loginInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={Colors.textLight}
            secureTextEntry
          />
          <Pressable
            style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.8 }]}
            onPress={handleLogin}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.loginBtnText}>Entrar</Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.adminHeader, { paddingTop: topInset + 12 }]}>
        <View style={styles.adminHeaderRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </Pressable>
          <Text style={styles.adminTitle}>Painel Admin</Text>
          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out" size={20} color={Colors.textOnDarkMuted} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
          {(["races", "results", "notifs", "schedule", "messages", "import"] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === "races" ? "Provas" : tab === "results" ? "Resultados" : tab === "notifs" ? "Avisos" : tab === "schedule" ? "Programa" : tab === "messages" ? "Mensagens" : "Importar"}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.adminContent} contentContainerStyle={{ paddingBottom: 120 + bottomInset }}>
        {activeTab === "races" && (
          <>
            <Pressable style={styles.addBtn} onPress={() => setShowRaceModal(true)}>
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.addBtnText}>Adicionar Prova</Text>
            </Pressable>

            {races.map((race: any) => (
              <View key={race.id} style={styles.adminCard}>
                <View style={styles.adminCardHeader}>
                  <Text style={styles.adminCardTitle}>
                    #{race.raceNumber} - {race.time} | {race.category} {race.gender} {race.boatType}
                  </Text>
                  <Pressable onPress={() => deleteRace(race.id)}>
                    <Ionicons name="trash" size={18} color={Colors.danger} />
                  </Pressable>
                </View>
                <Text style={styles.adminCardSub}>{race.phase} - {race.distance}m</Text>

                {(race.entries || []).map((e: any) => (
                  <Text key={e.id} style={styles.entryLine}>
                    Pista {e.lane}: {e.clubName} {e.resultTime ? `(${e.resultTime})` : ""}
                  </Text>
                ))}

                <Pressable
                  style={styles.addEntryBtn}
                  onPress={() => {
                    setSelectedRace(race);
                    setEntryForm({ lane: String((race.entries?.length || 0) + 1), clubName: "" });
                  }}
                >
                  <Ionicons name="add" size={16} color={Colors.accent} />
                  <Text style={styles.addEntryText}>Adicionar Tripulacao</Text>
                </Pressable>

                {selectedRace?.id === race.id && (
                  <View style={styles.entryFormContainer}>
                    <TextInput style={styles.miniInput} value={entryForm.lane} onChangeText={(v) => setEntryForm({...entryForm, lane: v})} placeholder="Pista" keyboardType="numeric" placeholderTextColor={Colors.textLight} />
                    <TextInput style={[styles.miniInput, { flex: 1 }]} value={entryForm.clubName} onChangeText={(v) => setEntryForm({...entryForm, clubName: v})} placeholder="Nome do Clube" placeholderTextColor={Colors.textLight} />
                    <Pressable style={styles.miniAddBtn} onPress={addEntry}>
                      <Ionicons name="checkmark" size={20} color={Colors.white} />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {activeTab === "results" && (
          <>
            <Text style={styles.sectionInfo}>Selecione uma prova para registar resultados</Text>
            {races.map((race: any) => (
              <Pressable
                key={race.id}
                style={styles.adminCard}
                onPress={() => openResultsFor(race)}
              >
                <Text style={styles.adminCardTitle}>
                  #{race.raceNumber} - {race.time} | {race.category} {race.gender} {race.boatType}
                </Text>
                <Text style={styles.adminCardSub}>
                  {race.entries?.some((e: any) => e.resultTime)
                    ? "Resultados registados"
                    : "Sem resultados"}
                </Text>
              </Pressable>
            ))}
          </>
        )}

        {activeTab === "notifs" && (
          <>
            <Pressable style={styles.addBtn} onPress={() => setShowNotifModal(true)}>
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.addBtnText}>Enviar Aviso</Text>
            </Pressable>

            {notifications.map((n: any) => (
              <View key={n.id} style={styles.adminCard}>
                <View style={styles.adminCardHeader}>
                  <Text style={styles.adminCardTitle}>{n.title}</Text>
                  <Pressable onPress={() => deleteNotif(n.id)}>
                    <Ionicons name="trash" size={18} color={Colors.danger} />
                  </Pressable>
                </View>
                <Text style={styles.adminCardSub}>{n.message}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === "schedule" && (
          <>
            <Pressable style={styles.addBtn} onPress={() => openScheduleModal()}>
              <Ionicons name="add-circle" size={20} color={Colors.white} />
              <Text style={styles.addBtnText}>Adicionar Entrada</Text>
            </Pressable>

            {scheduleItems.map((item: any) => (
              <View key={item.id} style={styles.adminCard}>
                <View style={styles.adminCardHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <View style={styles.scheduleIconPreview}>
                      <Ionicons name={item.icon as any} size={18} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.adminCardTitle}>{item.time} - {item.title}</Text>
                      <Text style={styles.adminCardSub}>Ordem: {item.sortOrder}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Pressable onPress={() => openScheduleModal(item)}>
                      <Ionicons name="pencil" size={18} color={Colors.primaryLight} />
                    </Pressable>
                    <Pressable onPress={() => deleteScheduleEntry(item.id)}>
                      <Ionicons name="trash" size={18} color={Colors.danger} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "messages" && (
          <>
            {messages.length === 0 ? (
              <Text style={styles.sectionInfo}>Sem mensagens recebidas</Text>
            ) : null}
            {messages.map((m: any) => (
              <View key={m.id} style={[styles.adminCard, !m.read && styles.unreadCard]}>
                <Text style={styles.adminCardTitle}>{m.subject}</Text>
                <Text style={styles.adminCardSub}>{m.name} {m.email ? `(${m.email})` : ""} {m.phone ? `- ${m.phone}` : ""}</Text>
                <Text style={styles.messageText}>{m.message}</Text>
              </View>
            ))}
          </>
        )}

        {activeTab === "import" && (
          <>
            <Text style={styles.importTitle}>Importar Programa</Text>
            <Text style={styles.importDesc}>
              Cole o JSON com o programa de provas no campo abaixo. O formato deve conter um objeto com a chave "races" (array de provas) ou diretamente um array de provas.
            </Text>

            <Pressable
              style={[styles.checkboxRow]}
              onPress={() => setClearOnImport(!clearOnImport)}
            >
              <View style={[styles.checkbox, clearOnImport && styles.checkboxActive]}>
                {clearOnImport && <Ionicons name="checkmark" size={14} color={Colors.white} />}
              </View>
              <Text style={styles.checkboxLabel}>Apagar provas existentes antes de importar</Text>
            </Pressable>

            <TextInput
              style={styles.importInput}
              value={importJson}
              onChangeText={setImportJson}
              placeholder='{"races": [...]}'
              placeholderTextColor={Colors.textLight}
              multiline
              textAlignVertical="top"
            />

            {importResult && (
              <View style={[styles.importResultBox, importResult.startsWith("Erro") ? styles.importResultError : styles.importResultSuccess]}>
                <Ionicons
                  name={importResult.startsWith("Erro") ? "alert-circle" : "checkmark-circle"}
                  size={18}
                  color={importResult.startsWith("Erro") ? Colors.danger : Colors.success}
                />
                <Text style={[styles.importResultText, importResult.startsWith("Erro") ? { color: Colors.danger } : { color: Colors.success }]}>
                  {importResult}
                </Text>
              </View>
            )}

            <Pressable
              style={[styles.addBtn, importLoading && { opacity: 0.6 }]}
              onPress={handleImport}
              disabled={importLoading || !importJson.trim()}
            >
              {importLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color={Colors.white} />
                  <Text style={styles.addBtnText}>Importar Programa</Text>
                </>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>

      <Modal visible={showRaceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: bottomInset + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Prova</Text>
              <Pressable onPress={() => setShowRaceModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Numero</Text>
                  <TextInput style={styles.formInput} value={raceForm.raceNumber} onChangeText={(v) => setRaceForm({...raceForm, raceNumber: v})} keyboardType="numeric" placeholder="1" placeholderTextColor={Colors.textLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Hora</Text>
                  <TextInput style={styles.formInput} value={raceForm.time} onChangeText={(v) => setRaceForm({...raceForm, time: v})} placeholder="09:30" placeholderTextColor={Colors.textLight} />
                </View>
              </View>

              <Text style={styles.formLabel}>Escalao</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {CATEGORIES.map((c) => (
                  <Pressable key={c} onPress={() => setRaceForm({...raceForm, category: c})} style={[styles.formChip, raceForm.category === c && styles.formChipActive]}>
                    <Text style={[styles.formChipText, raceForm.category === c && styles.formChipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Sexo</Text>
              <View style={styles.chipRowWrap}>
                {GENDERS.map((g) => (
                  <Pressable key={g} onPress={() => setRaceForm({...raceForm, gender: g})} style={[styles.formChip, raceForm.gender === g && styles.formChipActive]}>
                    <Text style={[styles.formChipText, raceForm.gender === g && styles.formChipTextActive]}>{g}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.formLabel}>Embarcacao</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {BOAT_TYPES.map((b) => (
                  <Pressable key={b} onPress={() => setRaceForm({...raceForm, boatType: b})} style={[styles.formChip, raceForm.boatType === b && styles.formChipActive]}>
                    <Text style={[styles.formChipText, raceForm.boatType === b && styles.formChipTextActive]}>{b}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Fase</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {PHASES.map((p) => (
                  <Pressable key={p} onPress={() => setRaceForm({...raceForm, phase: p})} style={[styles.formChip, raceForm.phase === p && styles.formChipActive]}>
                    <Text style={[styles.formChipText, raceForm.phase === p && styles.formChipTextActive]}>{p}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>Distancia (m)</Text>
                  <TextInput style={styles.formInput} value={raceForm.distance} onChangeText={(v) => setRaceForm({...raceForm, distance: v})} keyboardType="numeric" placeholderTextColor={Colors.textLight} />
                </View>
              </View>

              <Pressable style={styles.modalSubmitBtn} onPress={addRace}>
                <Text style={styles.modalSubmitText}>Criar Prova</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotifModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: bottomInset + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Aviso</Text>
              <Pressable onPress={() => setShowNotifModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>

            <Text style={styles.formLabel}>Tipo</Text>
            <View style={styles.chipRowWrap}>
              {[{v:"info",l:"Info"},{v:"warning",l:"Aviso"},{v:"urgent",l:"Urgente"},{v:"schedule",l:"Horario"}].map((t) => (
                <Pressable key={t.v} onPress={() => setNotifForm({...notifForm, type: t.v})} style={[styles.formChip, notifForm.type === t.v && styles.formChipActive]}>
                  <Text style={[styles.formChipText, notifForm.type === t.v && styles.formChipTextActive]}>{t.l}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.formLabel}>Titulo</Text>
            <TextInput style={styles.formInput} value={notifForm.title} onChangeText={(v) => setNotifForm({...notifForm, title: v})} placeholder="Titulo do aviso" placeholderTextColor={Colors.textLight} />

            <Text style={styles.formLabel}>Mensagem</Text>
            <TextInput style={[styles.formInput, { minHeight: 80 }]} value={notifForm.message} onChangeText={(v) => setNotifForm({...notifForm, message: v})} placeholder="Mensagem..." placeholderTextColor={Colors.textLight} multiline textAlignVertical="top" />

            <Pressable style={styles.modalSubmitBtn} onPress={addNotif}>
              <Text style={styles.modalSubmitText}>Enviar Aviso</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showScheduleModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: bottomInset + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingSchedule ? "Editar Entrada" : "Nova Entrada"}</Text>
              <Pressable onPress={() => setShowScheduleModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Hora</Text>
              <TextInput style={styles.formInput} value={scheduleForm.time} onChangeText={(v) => setScheduleForm({...scheduleForm, time: formatScheduleTime(v)})} placeholder="09:30" keyboardType="numeric" placeholderTextColor={Colors.textLight} maxLength={5} />
              <Text style={{ fontFamily: "Montserrat_400Regular", fontSize: 11, color: Colors.textLight, marginTop: 4 }}>Formato HH:MM — ordenado automaticamente</Text>

              <Text style={styles.formLabel}>Titulo</Text>
              <TextInput style={styles.formInput} value={scheduleForm.title} onChangeText={(v) => setScheduleForm({...scheduleForm, title: v})} placeholder="Ex: Remo Jovem" placeholderTextColor={Colors.textLight} />

              <Text style={styles.formLabel}>Icone</Text>
              <View style={styles.iconGrid}>
                {SCHEDULE_ICONS.map((ic) => (
                  <Pressable
                    key={ic}
                    onPress={() => setScheduleForm({...scheduleForm, icon: ic})}
                    style={[styles.iconOption, scheduleForm.icon === ic && styles.iconOptionActive]}
                  >
                    <Ionicons name={ic as any} size={22} color={scheduleForm.icon === ic ? Colors.white : Colors.textSecondary} />
                  </Pressable>
                ))}
              </View>

              <Pressable style={styles.modalSubmitBtn} onPress={saveScheduleEntry}>
                <Text style={styles.modalSubmitText}>{editingSchedule ? "Guardar" : "Criar Entrada"}</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showResultModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: bottomInset + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registar Resultados</Text>
              <Pressable onPress={() => setShowResultModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </Pressable>
            </View>
            {selectedRace && (
              <Text style={styles.resultRaceInfo}>
                #{selectedRace.raceNumber} - {selectedRace.category} {selectedRace.gender} {selectedRace.boatType}
              </Text>
            )}
            <ScrollView showsVerticalScrollIndicator={false}>
              {resultEntries.map((entry, idx) => (
                <View key={entry.id} style={styles.resultRow}>
                  <Text style={styles.resultClub}>P{entry.lane} - {entry.clubName}</Text>
                  <TextInput
                    style={styles.resultInput}
                    value={entry.resultTime}
                    onChangeText={(v) => {
                      const updated = [...resultEntries];
                      updated[idx] = { ...updated[idx], resultTime: formatTimeInput(v) };
                      setResultEntries(updated);
                    }}
                    placeholder="M:SS.ss"
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                  <View style={styles.statusChips}>
                    {["FIN", "DNS", "DNF", "DSQ"].map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => {
                          const updated = [...resultEntries];
                          if (s === "FIN") {
                            updated[idx] = { ...updated[idx], status: "FIN" };
                          } else {
                            updated[idx] = { ...updated[idx], status: s, resultTime: "" };
                          }
                          setResultEntries(updated);
                        }}
                        style={[styles.statusChip, entry.status === s && styles.statusChipActive]}
                      >
                        <Text style={[styles.statusChipText, entry.status === s && styles.statusChipTextActive]}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
              <Pressable style={styles.modalSubmitBtn} onPress={saveResults}>
                <Text style={styles.modalSubmitText}>Guardar Resultados</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.offWhite },
  loginHeader: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  loginTitle: { fontFamily: "Montserrat_700Bold", fontSize: 22, color: Colors.white },
  loginContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  loginIcon: { marginBottom: 16 },
  loginSubtitle: { fontFamily: "Montserrat_500Medium", fontSize: 14, color: Colors.textSecondary, marginBottom: 24 },
  loginError: { fontFamily: "Montserrat_500Medium", fontSize: 13, color: Colors.danger, marginBottom: 12 },
  loginInput: { width: "100%", backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontFamily: "Montserrat_400Regular", fontSize: 15, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  loginBtn: { width: "100%", backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  loginBtnText: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: Colors.white },

  adminHeader: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingBottom: 0 },
  adminHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  adminTitle: { fontFamily: "Montserrat_700Bold", fontSize: 22, color: Colors.white, flex: 1, textAlign: "center" },
  logoutBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  tabBar: { gap: 4, paddingBottom: 12 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.1)" },
  tabActive: { backgroundColor: Colors.accent },
  tabText: { fontFamily: "Montserrat_500Medium", fontSize: 13, color: Colors.textOnDarkMuted },
  tabTextActive: { color: Colors.white, fontFamily: "Montserrat_600SemiBold" },

  adminContent: { flex: 1, padding: 16 },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, marginBottom: 16 },
  addBtnText: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: Colors.white },
  adminCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: Colors.accent },
  adminCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adminCardTitle: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: Colors.textPrimary, flex: 1 },
  adminCardSub: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  messageText: { fontFamily: "Montserrat_400Regular", fontSize: 13, color: Colors.textPrimary, marginTop: 8, lineHeight: 20 },
  entryLine: { fontFamily: "Montserrat_400Regular", fontSize: 12, color: Colors.textSecondary, marginTop: 4, marginLeft: 8 },
  addEntryBtn: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  addEntryText: { fontFamily: "Montserrat_500Medium", fontSize: 12, color: Colors.accent },
  entryFormContainer: { flexDirection: "row", gap: 6, marginTop: 8, alignItems: "center" },
  miniInput: { backgroundColor: Colors.offWhite, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontFamily: "Montserrat_400Regular", fontSize: 13, borderWidth: 1, borderColor: Colors.border, width: 60 },
  miniAddBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.success, alignItems: "center", justifyContent: "center" },
  sectionInfo: { fontFamily: "Montserrat_400Regular", fontSize: 14, color: Colors.textSecondary, textAlign: "center", marginVertical: 20 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontFamily: "Montserrat_700Bold", fontSize: 20, color: Colors.textPrimary },
  formLabel: { fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  formInput: { backgroundColor: Colors.offWhite, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontFamily: "Montserrat_400Regular", fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  formRow: { flexDirection: "row", gap: 12 },
  chipRow: { marginBottom: 4 },
  chipRowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 4 },
  formChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.border, marginRight: 6 },
  formChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  formChipText: { fontFamily: "Montserrat_500Medium", fontSize: 13, color: Colors.textSecondary },
  formChipTextActive: { color: Colors.white, fontFamily: "Montserrat_600SemiBold" },
  modalSubmitBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 20 },
  modalSubmitText: { fontFamily: "Montserrat_700Bold", fontSize: 16, color: Colors.white },

  resultRaceInfo: { fontFamily: "Montserrat_600SemiBold", fontSize: 14, color: Colors.primary, marginBottom: 12 },
  resultRow: { backgroundColor: Colors.offWhite, borderRadius: 10, padding: 12, marginBottom: 8 },
  resultClub: { fontFamily: "Montserrat_600SemiBold", fontSize: 13, color: Colors.textPrimary, marginBottom: 6 },
  resultInputs: { flexDirection: "row", gap: 8 },
  resultInput: { backgroundColor: Colors.white, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontFamily: "Montserrat_400Regular", fontSize: 14, borderWidth: 1, borderColor: Colors.border },

  importTitle: { fontFamily: "Montserrat_700Bold", fontSize: 18, color: Colors.textPrimary, marginBottom: 8 },
  importDesc: { fontFamily: "Montserrat_400Regular", fontSize: 13, color: Colors.textSecondary, lineHeight: 20, marginBottom: 16 },
  importInput: { backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 14, fontFamily: "Montserrat_400Regular", fontSize: 13, color: Colors.textPrimary, minHeight: 200, marginBottom: 16 },
  importResultBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, marginBottom: 16 },
  importResultSuccess: { backgroundColor: "rgba(46,204,113,0.1)" },
  importResultError: { backgroundColor: "rgba(231,76,60,0.1)" },
  importResultText: { fontFamily: "Montserrat_500Medium", fontSize: 13, flex: 1 },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  checkboxLabel: { fontFamily: "Montserrat_500Medium", fontSize: 13, color: Colors.textPrimary },
  statusChips: { flexDirection: "row", gap: 6, marginTop: 8 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.border },
  statusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusChipText: { fontFamily: "Montserrat_500Medium", fontSize: 11, color: Colors.textSecondary },
  statusChipTextActive: { color: Colors.white },
  scheduleIconPreview: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(212,168,67,0.12)", alignItems: "center", justifyContent: "center" },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4, marginBottom: 8 },
  iconOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.offWhite, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  iconOptionActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
});
