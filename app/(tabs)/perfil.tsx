/**
 * app/(tabs)/perfil.tsx
 * Perfil del estudiante — US-004
 * Actualizado: insets reales, programas múltiples, materias actuales
 */

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Alert, ScrollView, StyleSheet, Text,
  TouchableOpacity, useColorScheme, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
import { MOCK_REQUESTS } from "@/utils/mockData";

// ── Mock: programas y materias del estudiante ─────────────────────────────────
// TODO: reemplazar con query a user_programs y user_subjects en Supabase
const MOCK_USER_PROGRAMS = [
  { id: "p1", name: "Ingeniería de Sistemas", faculty_name: "Ingeniería", is_primary: true },
  // Descomentar para probar doble programa:
  // { id: "p2", name: "Ingeniería Industrial", faculty_name: "Ingeniería", is_primary: false },
];

const MOCK_USER_SUBJECTS = [
  { id: "s1", name: "Cálculo Diferencial" },
  { id: "s3", name: "Programación Orientada a Objetos" },
  { id: "s4", name: "Estructuras de Datos" },
];

export default function PerfilScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const insets = useSafeAreaInsets();

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const myRequests = MOCK_REQUESTS.filter((r) => r.author_id === user?.id);

  const initials = (user?.fullName ?? "UC")
    .split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  // Programa principal para mostrar en el hero
  const primaryProgram = MOCK_USER_PROGRAMS.find(p => p.is_primary) ?? MOCK_USER_PROGRAMS[0];

  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: async () => {
        await signOut(); router.replace("/login");
      }},
    ]);
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.background, paddingTop: insets.top }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <View style={[styles.heroSection, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
          <View style={[styles.heroBar, { backgroundColor: C.primary }]} />
          <View style={[styles.avatarLarge, { backgroundColor: C.primary, borderColor: C.surface }]}>
            <Text style={styles.avatarLargeText}>{initials}</Text>
          </View>
          <View style={[styles.goldAccent, { backgroundColor: C.accent }]} />
          <Text style={[styles.profileName, { color: C.textPrimary }]}>
            {user?.fullName ?? "Estudiante"}
          </Text>
          <Text style={[styles.profileEmail, { color: C.textSecondary }]}>
            {user?.email ?? ""}
          </Text>
          {/* Badge programa principal */}
          {primaryProgram && (
            <View style={[styles.programBadge, { backgroundColor: C.primary + "12", borderColor: C.primary + "30" }]}>
              <Text style={[styles.programBadgeText, { color: C.primary }]}>
                🎓 {primaryProgram.name}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: C.primary }]}
            onPress={() => router.push("/editar-perfil")} activeOpacity={0.8}>
            <Text style={[styles.editBtnText, { color: C.primary }]}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* ── Información académica ────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Información académica</Text>
          </View>

          {/* Semestre */}
          <InfoRow emoji="📅" label="Semestre" value="6° semestre" C={C} />

          {/* Programas — puede ser más de uno */}
          <View style={styles.infoRow}>
            <Text style={styles.infoEmoji}>🎓</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: C.textSecondary }]}>
                Programa{MOCK_USER_PROGRAMS.length > 1 ? "s" : ""}
              </Text>
              {MOCK_USER_PROGRAMS.map(p => (
                <View key={p.id} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <Text style={[styles.infoValue, { color: C.textPrimary }]}>{p.name}</Text>
                  {p.is_primary && (
                    <View style={[styles.primaryBadge, { backgroundColor: C.accent + "30" }]}>
                      <Text style={[styles.primaryBadgeText, { color: C.accentDark }]}>Principal</Text>
                    </View>
                  )}
                </View>
              ))}
              <Text style={[styles.infoLabel, { color: C.textSecondary, marginTop: 4 }]}>
                🏫 {primaryProgram?.faculty_name ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Materias actuales ────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Materias actuales</Text>
            <TouchableOpacity onPress={() => router.push("/editar-perfil")}>
              <Text style={[styles.sectionAction, { color: C.primary }]}>Editar</Text>
            </TouchableOpacity>
          </View>

          {MOCK_USER_SUBJECTS.length === 0 ? (
            <View style={styles.emptySmall}>
              <Text style={[styles.emptySmallText, { color: C.textPlaceholder }]}>
                Aún no has registrado materias
              </Text>
            </View>
          ) : (
            <View style={styles.subjectsList}>
              {MOCK_USER_SUBJECTS.map((s, i) => (
                <View key={s.id} style={[styles.subjectChip, {
                  backgroundColor: C.primary + "10",
                  borderColor: C.primary + "30",
                }]}>
                  <Text style={[styles.subjectChipText, { color: C.primary }]}>
                    📖 {s.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Sobre mí ─────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Sobre mí</Text>
            <TouchableOpacity onPress={() => router.push("/editar-perfil")}>
              <Text style={[styles.sectionAction, { color: C.primary }]}>Editar</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.bioText, { color: C.textSecondary }]}>
            {/* TODO: profiles.bio desde  Supabase */}
            Estudiante apasionado por el desarrollo de software y la colaboración académica.
            Busco compañeros para aprender juntos. 📚
          </Text>
        </View>

        {/* ── Mis publicaciones ────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Mis publicaciones</Text>
            <TouchableOpacity onPress={() => router.push("/nueva-solicitud")}>
              <Text style={[styles.sectionAction, { color: C.primary }]}>+ Nueva</Text>
            </TouchableOpacity>
          </View>

          {myRequests.length === 0 ? (
            <View style={styles.emptySmall}>
              <Text style={{ fontSize: 28 }}>📭</Text>
              <Text style={[styles.emptySmallText, { color: C.textSecondary }]}>
                Aún no tienes solicitudes publicadas
              </Text>
            </View>
          ) : (
            myRequests.map((r) => (
              <TouchableOpacity key={r.id}
                style={[styles.miniCard, { borderColor: C.border }]}
                //onPress={() => router.push(`/solicitud/${r.id}`)}
                activeOpacity={0.85}>
                <View style={[styles.miniCardTag, { backgroundColor: C.primary + "12" }]}>
                  <Text style={[styles.miniCardTagText, { color: C.primary }]}>{r.subject_name}</Text>
                </View>
                <Text style={[styles.miniCardTitle, { color: C.textPrimary }]}>{r.title}</Text>
                <Text style={[styles.miniCardMeta, { color: C.textSecondary }]}>
                  👥 {r.applications_count ?? 0} postulaciones · {r.modality}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Estadísticas ─────────────────────────────────────────────── */}
        <View style={[styles.statsRow, { borderColor: C.border, backgroundColor: C.surface }]}>
          <StatBox label="Publicaciones" value={String(myRequests.length)} C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatBox label="Grupos" value="0" C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatBox label="Materias" value={String(MOCK_USER_SUBJECTS.length)} C={C} />
        </View>

        {/* ── Cerrar sesión ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: C.borderError }]}
          onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={[styles.signOutText, { color: C.error }]}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────
function InfoRow({ emoji, label, value, C }: {
  emoji: string; label: string; value: string; C: typeof Colors["light"];
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue,  { color: C.textPrimary  }]}>{value}</Text>
      </View>
    </View>
  );
}

function StatBox({ label, value, C }: {
  label: string; value: string; C: typeof Colors["light"];
}) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: C.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: C.textSecondary }]}>{label}</Text>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },

  heroSection: { alignItems: "center", paddingBottom: 24, borderBottomWidth: 1, marginBottom: 12, overflow: "hidden" },
  heroBar:     { width: "100%", height: 80, marginBottom: -40 },
  avatarLarge: { width: 88, height: 88, borderRadius: 44, alignItems: "center",
    justifyContent: "center", marginBottom: 12, borderWidth: 3 },
  avatarLargeText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  goldAccent:  { width: 32, height: 4, borderRadius: 2, marginBottom: 10 },
  profileName: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3, marginBottom: 4 },
  profileEmail:{ fontSize: 13, marginBottom: 10 },
  programBadge:{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, marginBottom: 14 },
  programBadgeText: { fontSize: 13, fontWeight: "600" },
  editBtn:     { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  editBtnText: { fontSize: 14, fontWeight: "600" },

  section: { marginHorizontal: 16, marginBottom: 12, borderRadius: 12, borderWidth: 1, padding: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle:  { fontSize: 15, fontWeight: "700" },
  sectionAction: { fontSize: 13, fontWeight: "600" },

  infoRow:    { flexDirection: "row", alignItems: "flex-start", paddingVertical: 8 },
  infoEmoji:  { fontSize: 18, marginRight: 12, marginTop: 2 },
  infoContent:{ flex: 1 },
  infoLabel:  { fontSize: 11, marginBottom: 2 },
  infoValue:  { fontSize: 14, fontWeight: "500" },
  primaryBadge:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  primaryBadgeText: { fontSize: 10, fontWeight: "700" },

  bioText: { fontSize: 14, lineHeight: 22 },

  subjectsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectChip:  { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  subjectChipText: { fontSize: 13, fontWeight: "500" },

  emptySmall:     { alignItems: "center", paddingVertical: 16, gap: 6 },
  emptySmallText: { fontSize: 13, textAlign: "center" },

  miniCard:        { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 8 },
  miniCardTag:     { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginBottom: 6 },
  miniCardTagText: { fontSize: 11, fontWeight: "600" },
  miniCardTitle:   { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  miniCardMeta:    { fontSize: 12 },

  statsRow:    { flexDirection: "row", marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  statBox:     { flex: 1, alignItems: "center", paddingVertical: 16 },
  statDivider: { width: 1 },
  statValue:   { fontSize: 20, fontWeight: "800" },
  statLabel:   { fontSize: 11, marginTop: 2 },

  signOutBtn:  { marginHorizontal: 16, borderWidth: 1.5, borderRadius: 10,
    paddingVertical: 14, alignItems: "center", marginBottom: 8 },
  signOutText: { fontSize: 14, fontWeight: "600" },
});