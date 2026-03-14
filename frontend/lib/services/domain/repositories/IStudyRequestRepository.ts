import type { StudyRequest } from "@/types"

export interface IStudyRequestRepository {
  getById(id: string): Promise<StudyRequest | null>
  getFeed(filters?: { subject_id?: string; search?: string }, page?: number, pageSize?: number): Promise<StudyRequest[]>
  getByAuthor(userId: string): Promise<StudyRequest[]>
  create(userId: string, payload: { title: string; description: string; subject_id: string; max_members: number }): Promise<StudyRequest>
  updateStatus(requestId: string, status: "abierta" | "cerrada" | "expirada"): Promise<void>
  updateContent(requestId: string, userId: string, payload: { title?: string; description?: string }): Promise<void>
  cancel(requestId: string, userId: string): Promise<void>
}
