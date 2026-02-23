/**
 * app/editar-perfil.tsx
 * Modal para editar el perfil — US-004
 */

import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
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

export default function EditarPerfilScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const user = useAuthStore((s) => s.user);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [bio, setBio] = useState("");
  const [career, setCareer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName.trim()) return;

    setIsLoading(true);
    try {
      // TODO: actualizar tabla profiles en Supabase
      // await supabase
      //   .from("profiles")
      //   .update({ full_name: fullName, bio, career })
      //   .eq("id", user.id);

      await new Promise((r) => setTimeout(r, 800));
      Alert.alert("Perfil actualizado", "Los cambios se guardaron correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Field label="Nombre completo" C={C}>
          <TextInput
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Tu nombre completo"
            placeholderTextColor={C.textPlaceholder}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Carrera" C={C}>
          <TextInput
            style={[styles.input, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
            value={career}
            onChangeText={setCareer}
            placeholder="Ej: Ingeniería de Sistemas"
            placeholderTextColor={C.textPlaceholder}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Sobre mí" C={C}>
          <TextInput
            style={[styles.textArea, { backgroundColor: C.surface, borderColor: C.border, color: C.textPrimary }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntale a tus compañeros sobre ti..."
            placeholderTextColor={C.textPlaceholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: fullName.trim() ? C.primary : C.border }]}
          onPress={handleSave}
          disabled={!fullName.trim() || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.saveBtnText, { color: fullName.trim() ? C.textOnPrimary : C.textSecondary }]}>
              Guardar cambios
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children, C }: { label: string; children: React.ReactNode; C: (typeof Colors)["light"] }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: C.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 20, gap: 4 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "500", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, height: 48, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 8, padding: 14, fontSize: 14, minHeight: 100 },
  saveBtn: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  saveBtnText: { fontSize: 15, fontWeight: "700" },
});