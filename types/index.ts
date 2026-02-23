/**
 * types/index.ts
 * Tipos compartidos del dominio UniConnect
 * Refleja el modelo de datos de Supabase/PostgreSQL
 */

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  career?: string;
  faculty_id?: string;
  faculty_name?: string; // join
  created_at: string;
}

export interface Faculty {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  faculty_id: string;
  faculty_name?: string; // join
}

export interface StudyRequest {
  id: string;
  author_id: string;
  author: Profile;           // join con profiles
  subject_id: string;
  subject_name: string;      // join con subjects
  faculty_name: string;      // join con faculties
  title: string;
  description: string;
  max_members: number;
  modality: "presencial" | "virtual" | "híbrido";
  status: "abierta" | "cerrada";
  created_at: string;
  applications_count?: number;
}

export interface Application {
  id: string;
  request_id: string;
  applicant_id: string;
  applicant: Profile;        // join con profiles
  message: string;
  status: "pendiente" | "aceptada" | "rechazada";
  created_at: string;
}