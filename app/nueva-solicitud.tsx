/**
 * app/nueva-solicitud.tsx
 * Modal para crear una solicitud de estudio — US-005
 */

import { Colors } from "@/constants/Colors";
import { MOCK_SUBJECTS } from "@/utils/mockData";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

const MODALITIES = ["presencial", "virtual", "híbrido"] as const;

export default function NuevaSolicitudScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [modality, setModality] = useState<"presencial" | "virtual" | "híbrido">("presencial");
  const [maxMembers, setMaxMembers] = useState("4");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = title.trim().length >= 5 && description.trim().length >= 10 && selectedSubject;

  const handleCreate = async () => {
    if (!isValid) return;

    setIsLoading(true);
    try {
      // TODO: insertar en tabla study_requests de Supabase
      // await supabase.from("study_requests").insert({
      //   author_id: user.id,
      //   subject_id: selectedSubject,
      //   title: title.trim(),
      //   description: description.trim(),
      //   modality,
      //   max_members: parseInt(maxMembers),
      //   status: "abierta",
      // });

      await new Promise((r) => setTimeout(r, 900));
      Alert.alert(
        "¡Solicitud creada!",
        "Tu grupo de estudio ya está visible en el feed.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "No se pudo crear la solicitud.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Materia */}
        <Text style={[styles.label, { color: C.textSecondary }]}>Materia *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsRow}>
          {MOCK_SUBJECTS.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[
                styles.subjectChip,
                {
                  backgroundColor: selectedSubject === s.id ? C.primary : C.surface,
                  borderColor: selectedSubject === s.id ? C.primary : C.border,
                },
              ]}
              onPress={() => setSelectedSubject(s.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.subjectChipText,
                  { color: selectedSubject === s.id ? C.textOnPrimary : C.textSecondary },
                ]}
              >
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Título */}
        <View style={styles.fieldGap}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Título *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
            placeholder="Ej: Grupo para el parcial de Cálculo"
            placeholderTextColor={C.textPlaceholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Descripción */}
        <View style={styles.fieldGap}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Descripción *</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
            placeholder="¿Qué temas van a ver? ¿Cuándo se reúnen?..."
            placeholderTextColor={C.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Modalidad */}
        <View style={styles.fieldGap}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Modalidad</Text>
          <View style={styles.modalityRow}>
            {MODALITIES.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modalityBtn,
                  {
                    backgroundColor: modality === m ? C.primary : C.surface,
                    borderColor: modality === m ? C.primary : C.border,
                    flex: 1,
                  },
                ]}
                onPress={() => setModality(m)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.modalityText,
                    { color: modality === m ? C.textOnPrimary : C.textSecondary },
                  ]}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Máximo de miembros */}
        <View style={styles.fieldGap}>
          <Text style={[styles.label, { color: C.textSecondary }]}>Máximo de miembros</Text>
          <View style={styles.membersRow}>
            {["2", "3", "4", "5", "6"].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.memberBtn,
                  {
                    backgroundColor: maxMembers === n ? C.primary : C.surface,
                    borderColor: maxMembers === n ? C.primary : C.border,
                  },
                ]}
                onPress={() => setMaxMembers(n)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.memberBtnText,
                    { color: maxMembers === n ? C.textOnPrimary : C.textSecondary },
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: isValid ? C.primary : C.border }]}
          onPress={handleCreate}
          disabled={!isValid || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.submitBtnText, { color: isValid ? C.textOnPrimary : C.textSecondary }]}>
              Publicar solicitud
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  fieldGap: { marginTop: 16 },

  subjectsRow: { marginBottom: 4 },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  subjectChipText: { fontSize: 13, fontWeight: "500" },

  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, height: 48, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 14, minHeight: 100 },

  modalityRow: { flexDirection: "row", gap: 8 },
  modalityBtn: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  modalityText: { fontSize: 13, fontWeight: "500" },

  membersRow: { flexDirection: "row", gap: 8 },
  memberBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  memberBtnText: { fontSize: 15, fontWeight: "600" },

  submitBtn: { borderRadius: 10, paddingVertical: 15, alignItems: "center", marginTop: 24 },
  submitBtnText: { fontSize: 15, fontWeight: "700" },
});