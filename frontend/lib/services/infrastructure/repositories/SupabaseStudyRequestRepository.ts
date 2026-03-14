import { supabase } from "@/lib/supabase"
import { apiGet, apiPatch } from "@/lib/api/client"
import type { IStudyRequestRepository } from "../../domain/repositories/IStudyRequestRepository"
import type { StudyRequest } from "@/types"

export class SupabaseStudyRequestRepository implements IStudyRequestRepository {
  async getById(id: string): Promise<StudyRequest | null> {
    const { data, error } = await supabase
      .from("study_requests")
      .select("*, subjects ( name )")
      .eq("id", id)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data ?? null
  }

  async getFeed(filters?: { subject_id?: string; search?: string }, page = 0, pageSize = 10): Promise<StudyRequest[]> {
    return apiGet<StudyRequest>("study_requests", (q) => {
      let query = q
        .select("*, subjects ( name )")
        .eq("status", "abierta")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

      if (filters?.subject_id) query = query.eq("subject_id", filters.subject_id)
      if (filters?.search) query = query.ilike("title", `%${filters.search}%`)

      return query
    })
  }

  async getByAuthor(userId: string): Promise<StudyRequest[]> {
    const { data, error } = await supabase
      .from("study_requests")
      .select("*, subjects ( name )")
      .eq("author_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    const requests = (data ?? []) as StudyRequest[]
    if (requests.length === 0) return requests

    const requestIds = requests.map((r) => r.id)
    const acceptedByRequest: Record<string, number> = {}

    const { data: acceptedRows, error: acceptedErr } = await supabase
      .from("applications")
      .select("request_id")
      .in("request_id", requestIds)
      .eq("status", "aceptada")

    if (!acceptedErr) {
      const rows: any[] = acceptedRows ?? []
      for (let i = 0; i < rows.length; i++) {
        const reqId = String(rows[i].request_id ?? "")
        if (!reqId) continue
        acceptedByRequest[reqId] = (acceptedByRequest[reqId] ?? 0) + 1
      }
    }

    return requests.map((r) => ({
      ...r,
      applications_count: Math.min((acceptedByRequest[r.id] ?? 0) + 1, r.max_members),
    }))
  }

  async create(userId: string, payload: { title: string; description: string; subject_id: string; max_members: number }): Promise<StudyRequest> {
    const { data, error } = await supabase
      .from("study_requests")
      .insert({
        author_id: userId,
        title: payload.title,
        description: payload.description,
        subject_id: payload.subject_id,
        max_members: payload.max_members,
        status: "abierta",
        is_active: true,
      })
      .select("*, subjects ( name )")
      .single()

    if (error) {
      if (error.message.includes("validate_request_subject")) {
        throw new Error("Solo puedes crear solicitudes de materias que estes cursando actualmente.")
      }
      throw error
    }

    return data as StudyRequest
  }

  async updateStatus(requestId: string, status: "abierta" | "cerrada" | "expirada"): Promise<void> {
    await apiPatch<StudyRequest>("study_requests", { status }, (q) => q.eq("id", requestId))
  }

  async updateContent(requestId: string, userId: string, payload: { title?: string; description?: string }): Promise<void> {
    const { error } = await supabase.rpc("update_request_content_as_admin", {
      p_request_id: requestId,
      p_actor_user_id: userId,
      p_title: payload.title ?? null,
      p_description: payload.description ?? null,
    })

    if (error) throw new Error(error.code === "P0001" ? error.message : error.message)
  }

  async cancel(requestId: string, userId: string): Promise<void> {
    const { error } = await supabase.rpc("cancel_study_request", {
      p_request_id: requestId,
      p_actor_user_id: userId,
    })

    if (error) throw new Error(error.code === "P0001" ? error.message : error.message)
  }
}
