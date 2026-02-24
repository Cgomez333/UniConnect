/**
 * lib/services/profileService.ts
 * Perfil del estudiante: leer, actualizar, programas y materias
 */

import { supabase } from "@/lib/supabase"

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  role: "estudiante" | "admin"
  semester: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProgram {
  user_id: string
  program_id: string
  is_primary: boolean
  enrolled_at: string
  // join
  programs?: {
    id: string
    name: string
    faculty_id: string
    faculties?: { name: string }
  }
}

export interface UserSubject {
  user_id: string
  subject_id: string
  enrolled_at: string
  // join
  subjects?: { id: string; name: string }
}

// ── Leer perfil ───────────────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (error) throw error
  return data
}

// ── Actualizar perfil ─────────────────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: {
    full_name?: string
    bio?: string
    semester?: number
    avatar_url?: string
  }
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ── Programas del usuario ─────────────────────────────────────────────────────
// Trae los programas con nombre de facultad incluido
export async function getMyPrograms(userId: string): Promise<UserProgram[]> {
  const { data, error } = await supabase
    .from("user_programs")
    .select(`
      *,
      programs (
        id,
        name,
        faculty_id,
        faculties ( name )
      )
    `)
    .eq("user_id", userId)
    .order("is_primary", { ascending: false }) // el principal primero

  if (error) throw error
  return data ?? []
}

// Agregar un programa al perfil del estudiante
export async function addMyProgram(
  userId: string,
  programId: string,
  isPrimary = false
): Promise<void> {
  // Si es primario, desmarcar el actual
  if (isPrimary) {
    await supabase
      .from("user_programs")
      .update({ is_primary: false })
      .eq("user_id", userId)
  }

  const { error } = await supabase
    .from("user_programs")
    .insert({ user_id: userId, program_id: programId, is_primary: isPrimary })

  if (error) throw error
}

// Eliminar un programa del perfil
export async function removeMyProgram(
  userId: string,
  programId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_programs")
    .delete()
    .eq("user_id", userId)
    .eq("program_id", programId)

  if (error) throw error
}

// Marcar un programa como principal
export async function setPrimaryProgram(
  userId: string,
  programId: string
): Promise<void> {
  // Desmarcar todos
  await supabase
    .from("user_programs")
    .update({ is_primary: false })
    .eq("user_id", userId)

  // Marcar el nuevo
  const { error } = await supabase
    .from("user_programs")
    .update({ is_primary: true })
    .eq("user_id", userId)
    .eq("program_id", programId)

  if (error) throw error
}

// ── Materias actuales del usuario ─────────────────────────────────────────────
export async function getMySubjects(userId: string): Promise<UserSubject[]> {
  const { data, error } = await supabase
    .from("user_subjects")
    .select(`
      *,
      subjects ( id, name )
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

// Agregar una materia al perfil (el trigger valida que pertenezca a un programa del usuario)
export async function addMySubject(
  userId: string,
  subjectId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_subjects")
    .insert({ user_id: userId, subject_id: subjectId })

  if (error) {
    // El trigger lanza un error si la materia no pertenece a los programas del usuario
    if (error.message.includes("validate_user_subject")) {
      throw new Error("Esta materia no pertenece a ninguno de tus programas registrados.")
    }
    throw error
  }
}

// Eliminar una materia del perfil
export async function removeMySubject(
  userId: string,
  subjectId: string
): Promise<void> {
  const { error } = await supabase
    .from("user_subjects")
    .delete()
    .eq("user_id", userId)
    .eq("subject_id", subjectId)

  if (error) throw error
}