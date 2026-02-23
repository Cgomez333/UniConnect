/**
 * app/(tabs)/perfil.tsx
 *
 * Perfil del estudiante autenticado — US-004
 * También sirve como base para ver perfil de terceros — US-008
 */

import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useAuthStore } from "@/store/useAuthStore";
import { MOCK_REQUESTS } from "@/utils/mockData";

export default function PerfilScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  // Mis publicaciones (mock: filtrar por author_id)
  const myRequests = MOCK_REQUESTS.filter((r) => r.author_id === user?.id);

  const initials = (user?.fullName ?? "UC")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header: Avatar + nombre ──────────────────────────────────── */}
        <View style={[styles.heroSection, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
          {/* Franja decorativa azul arriba */}
          <View style={[styles.heroBar, { backgroundColor: C.primary }]} />

          {/* Avatar grande */}
          <View style={[styles.avatarLarge, { backgroundColor: C.primary }]}>
            <Text style={styles.avatarLargeText}>{initials}</Text>
          </View>

          {/* Punto dorado decorativo */}
          <View style={[styles.goldAccent, { backgroundColor: C.accent }]} />

          <Text style={[styles.profileName, { color: C.textPrimary }]}>
            {user?.fullName ?? "Estudiante"}
          </Text>
          <Text style={[styles.profileEmail, { color: C.textSecondary }]}>
            {user?.email ?? ""}
          </Text>

          {/* Botón editar perfil */}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: C.primary }]}
            onPress={() => router.push("/editar-perfil")}
            activeOpacity={0.8}
          >
            <Text style={[styles.editBtnText, { color: C.primary }]}>
              Editar perfil
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Info académica ───────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
            Información académica
          </Text>

          <InfoRow
            emoji="🎓"
            label="Carrera"
            value="Ingeniería de Sistemas"  // TODO: del perfil de Supabase
            C={C}
          />
          <InfoRow
            emoji="🏫"
            label="Facultad"
            value="Ingeniería"
            C={C}
          />
          <InfoRow
            emoji="📅"
            label="Semestre"
            value="6° semestre"
            C={C}
          />
        </View>

        {/* ── Biografía ────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              Sobre mí
            </Text>
            <TouchableOpacity onPress={() => router.push("/editar-perfil")}>
              <Text style={[styles.sectionAction, { color: C.primary }]}>Editar</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.bioText, { color: C.textSecondary }]}>
            {/* TODO: del perfil de Supabase */}
            Estudiante apasionado por el desarrollo de software y la colaboración académica.
            Busco compañeros para aprender juntos. 📚
          </Text>
        </View>

        {/* ── Mis solicitudes ──────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              Mis publicaciones
            </Text>
            <TouchableOpacity onPress={() => router.push("/nueva-solicitud")}>
              <Text style={[styles.sectionAction, { color: C.primary }]}>+ Nueva</Text>
            </TouchableOpacity>
          </View>

          {myRequests.length === 0 ? (
            <View style={styles.emptyRequests}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={[styles.emptyText, { color: C.textSecondary }]}>
                Aún no tienes solicitudes publicadas
              </Text>
            </View>
          ) : (
            myRequests.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.miniCard, { borderColor: C.border }]}
                //onPress={() => router.push(`/solicitud/${r.id}`)}
                activeOpacity={0.85}
              >
                <View style={[styles.miniCardTag, { backgroundColor: C.primary + "12" }]}>
                  <Text style={[styles.miniCardTagText, { color: C.primary }]}>
                    {r.subject_name}
                  </Text>
                </View>
                <Text style={[styles.miniCardTitle, { color: C.textPrimary }]}>
                  {r.title}
                </Text>
                <Text style={[styles.miniCardMeta, { color: C.textSecondary }]}>
                  👥 {r.applications_count ?? 0} postulaciones · {r.modality}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* ── Estadísticas rápidas ─────────────────────────────────────── */}
        <View style={[styles.statsRow, { borderColor: C.border }]}>
          <StatBox label="Publicaciones" value="0" C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatBox label="Grupos unidos" value="0" C={C} />
          <View style={[styles.statDivider, { backgroundColor: C.border }]} />
          <StatBox label="Postulaciones" value="0" C={C} />
        </View>

        {/* ── Cerrar sesión ────────────────────────────────────────────── */}
        <TouchableOpacity
          style={[styles.signOutBtn, { borderColor: C.borderError }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={[styles.signOutText, { color: C.error }]}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────
function InfoRow({
  emoji,
  label,
  value,
  C,
}: {
  emoji: string;
  label: string;
  value: string;
  C: (typeof Colors)["light"];
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: C.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: C.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

function StatBox({
  label,
  value,
  C,
}: {
  label: string;
  value: string;
  C: (typeof Colors)["light"];
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

  // Hero
  heroSection: {
    alignItems: "center",
    paddingBottom: 24,
    borderBottomWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  heroBar: {
    width: "100%",
    height: 80,
    marginBottom: -40,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarLargeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  goldAccent: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    marginBottom: 16,
  },
  editBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Secciones
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "600",
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoEmoji: { fontSize: 18, marginRight: 12 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "500" },

  // Bio
  bioText: { fontSize: 14, lineHeight: 22 },

  // Mini cards
  miniCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  miniCardTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  miniCardTagText: { fontSize: 11, fontWeight: "600" },
  miniCardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  miniCardMeta: { fontSize: 12 },

  // Empty
  emptyRequests: { alignItems: "center", paddingVertical: 20 },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13, textAlign: "center" },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  statDivider: { width: 1 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },

  // Sign out
  signOutBtn: {
    marginHorizontal: 16,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: { fontSize: 14, fontWeight: "600" },
});