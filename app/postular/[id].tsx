/**
 * app/postular/[id].tsx
 * Modal para postularse a una solicitud — US-009
 */

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { MOCK_REQUESTS } from "@/utils/mockData";

export default function PostularScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const { id } = useLocalSearchParams<{ id: string }>();

  const request = MOCK_REQUESTS.find((r) => r.id === id);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePostulate = async () => {
    if (message.trim().length < 10) return;

    setIsLoading(true);
    try {
      // TODO: insertar en tabla applications de Supabase
      // await supabase.from("applications").insert({
      //   request_id: id,
      //   applicant_id: user.id,
      //   message: message.trim(),
      //   status: "pendiente",
      // });

      await new Promise((r) => setTimeout(r, 800)); // simulación

      Alert.alert(
        "¡Postulación enviada!",
        "El autor del grupo recibirá tu solicitud y te contactará si es aceptada.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo enviar tu postulación. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!request) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: C.textPrimary }]}>
            Solicitud no encontrada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <View style={styles.content}>
        {/* Info de la solicitud */}
        <View style={[styles.infoBox, { backgroundColor: C.primary + "10", borderColor: C.primary + "30" }]}>
          <Text style={[styles.infoSubject, { color: C.primary }]}>
            {request.subject_name}
          </Text>
          <Text style={[styles.infoTitle, { color: C.textPrimary }]}>
            {request.title}
          </Text>
          <Text style={[styles.infoAuthor, { color: C.textSecondary }]}>
            Por {request.author.full_name}
          </Text>
        </View>

        {/* Mensaje */}
        <Text style={[styles.label, { color: C.textSecondary }]}>
          Cuéntale por qué quieres unirte
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: C.surface,
              borderColor: message.length > 0 ? C.borderFocus : C.border,
              color: C.textPrimary,
            },
          ]}
          placeholder="Ej: Soy estudiante de 5to semestre, manejo bien los temas de la materia y me gustaría repasar antes del parcial..."
          placeholderTextColor={C.textPlaceholder}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: C.textPlaceholder }]}>
          {message.length} caracteres {message.length < 10 ? "(mín. 10)" : "✓"}
        </Text>

        {/* Botón */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              backgroundColor:
                message.trim().length >= 10 ? C.primary : C.border,
            },
          ]}
          onPress={handlePostulate}
          disabled={message.trim().length < 10 || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                styles.submitBtnText,
                {
                  color:
                    message.trim().length >= 10
                      ? C.textOnPrimary
                      : C.textSecondary,
                },
              ]}
            >
              Enviar postulación
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: C.textSecondary }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 14 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },

  infoBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  infoSubject: { fontSize: 12, fontWeight: "600" },
  infoTitle: { fontSize: 15, fontWeight: "700" },
  infoAuthor: { fontSize: 12 },

  label: { fontSize: 14, fontWeight: "500" },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    minHeight: 120,
    lineHeight: 20,
  },
  charCount: { fontSize: 12, textAlign: "right", marginTop: -8 },

  submitBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelText: { fontSize: 14 },
});