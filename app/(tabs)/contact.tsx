import React, { useState } from "react";
import {
  StyleSheet, Text, View, TextInput, Pressable, Platform,
  ScrollView, Alert, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { apiRequest } from "@/lib/query-client";
import Colors from "@/constants/colors";

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const canSubmit = name.trim() && subject.trim() && message.trim();

  const handleSubmit = async () => {
    if (!canSubmit || sending) return;
    setSending(true);
    try {
      await apiRequest("POST", "/api/contacts", {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        subject: subject.trim(),
        message: message.trim(),
      });
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      Alert.alert("Erro", "Nao foi possivel enviar a mensagem. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: topInset + 12 }]}>
          <Text style={styles.headerTitle}>Contacto</Text>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Mensagem enviada!</Text>
          <Text style={styles.successText}>
            A organizacao recebeu a sua mensagem e respondera o mais brevemente possivel.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.newMessageBtn, pressed && { opacity: 0.8 }]}
            onPress={() => setSent(false)}
          >
            <Text style={styles.newMessageBtnText}>Enviar outra mensagem</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: topInset + 12 }]}>
        <Text style={styles.headerTitle}>Contacto</Text>
        <Text style={styles.headerSubtitle}>Entre em contacto com a organizacao</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.form}
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="O seu nome"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@exemplo.com"
              placeholderTextColor={Colors.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+351 912 345 678"
              placeholderTextColor={Colors.textLight}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Assunto *</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Ex: Questao sobre horarios"
              placeholderTextColor={Colors.textLight}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Mensagem *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Descreva a sua questao ou situacao..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
              pressed && canSubmit && { transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit || sending}
          >
            {sending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={18} color={Colors.white} />
                <Text style={styles.submitButtonText}>Enviar mensagem</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.requiredNote}>* Campos obrigatorios</Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
  form: {
    flex: 1,
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: "Montserrat_400Regular",
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 16,
    color: Colors.white,
  },
  requiredNote: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 12,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 12,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 22,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  successText: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  newMessageBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  newMessageBtnText: {
    fontFamily: "Montserrat_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
});
