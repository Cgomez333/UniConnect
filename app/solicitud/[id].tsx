/**
 * app/solicitud/[id].tsx
 * Detalle de una solicitud de estudio — US-008
 */

import { Colors } from "@/constants/Colors";
import { MOCK_REQUESTS } from "@/utils/mockData";
import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const MODALITY_LABEL: Record<string, string> = {
  presencial: "📍 Presencial",
  virtual: "💻 Virtual",
  híbrido: "🔄 Híbrido",
};

export default function DetalleSolicitudScreen() {
  const scheme = useColorScheme() ?? "light";
  const C = Colors[scheme];
  const { id } = useLocalSearchParams<{ id: string }>();

  // TODO: reemplazar con query a Supabase
  const request = MOCK_REQUESTS.find((r) => r.id === id);

  if (!request) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={styles.notFound}>
          <Text style={styles.emoji}>😕</Text>
          <Text style={[styles.notFoundText, { color: C.textPrimary }]}>
            Solicitud no encontrada
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.backLink, { color: C.primary }]}>
              ← Volver
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = request.author.full_name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Autor ────────────────────────────────────────────── */}
        <View style={[styles.authorCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.avatar, { backgroundColor: C.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: C.primary }]}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.authorName, { color: C.textPrimary }]}>
              {request.author.full_name}
            </Text>
            <Text style={[styles.authorMeta, { color: C.textSecondary }]}>
              {request.author.career ?? "Estudiante"} · {request.faculty_name}
            </Text>
          </View>
        </View>

        {/* ── Contenido ────────────────────────────────────────── */}
        <View style={[styles.contentCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <View style={[styles.subjectTag, { backgroundColor: C.primary + "12" }]}>
            <Text style={[styles.subjectText, { color: C.primary }]}>
              {request.subject_name}
            </Text>
          </View>

          <Text style={[styles.title, { color: C.textPrimary }]}>
            {request.title}
          </Text>
          <Text style={[styles.description, { color: C.textSecondary }]}>
            {request.description}
          </Text>
        </View>

        {/* ── Detalles ─────────────────────────────────────────── */}
        <View style={[styles.detailsCard, { backgroundColor: C.surface, borderColor: C.border }]}>
          <DetailRow label="Modalidad" value={MODALITY_LABEL[request.modality]} C={C} />
          <DetailRow
            label="Cupos"
            value={`${request.applications_count ?? 0} de ${request.max_members} ocupados`}
            C={C}
          />
          <DetailRow
            label="Estado"
            value={request.status === "abierta" ? "✅ Abierta" : "🔒 Cerrada"}
            C={C}
          />
        </View>

        {/* ── Botón postularse ─────────────────────────────────── */}
        {request.status === "abierta" && (
          <TouchableOpacity
            style={[styles.postulateBtn, { backgroundColor: C.primary }]}
            //onPress={() => router.push(`/postular/${request.id}`)}
            activeOpacity={0.85}
          >
            <Text style={[styles.postulateBtnText, { color: C.textOnPrimary }]}>
              Postularme a este grupo
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  C,
}: {
  label: string;
  value: string;
  C: (typeof Colors)["light"];
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: C.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: C.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },

  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700" },
  authorName: { fontSize: 15, fontWeight: "600" },
  authorMeta: { fontSize: 12, marginTop: 2 },

  contentCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  subjectTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectText: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "800", lineHeight: 24 },
  description: { fontSize: 14, lineHeight: 22 },

  detailsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: { fontSize: 13 },
  detailValue: { fontSize: 13, fontWeight: "600" },

  postulateBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  postulateBtnText: { fontSize: 15, fontWeight: "700" },

  notFound: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emoji: { fontSize: 40 },
  notFoundText: { fontSize: 16, fontWeight: "600" },
  backLink: { fontSize: 14, fontWeight: "600" },
});