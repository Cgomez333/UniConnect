/**
 * utils/mockData.ts
 * Datos de prueba para desarrollo sin Supabase
 * Eliminar o ignorar cuando el backend esté conectado
 */

import { Faculty, Profile, StudyRequest, Subject } from "@/types";

export const MOCK_FACULTIES: Faculty[] = [
  { id: "f1", name: "Ingeniería" },
  { id: "f2", name: "Ciencias Exactas y Naturales" },
  { id: "f3", name: "Ciencias Jurídicas y Sociales" },
  { id: "f4", name: "Artes y Humanidades" },
  { id: "f5", name: "Ciencias Agropecuarias" },
];

export const MOCK_SUBJECTS: Subject[] = [
  { id: "s1", name: "Cálculo Diferencial", faculty_id: "f1", faculty_name: "Ingeniería" },
  { id: "s2", name: "Álgebra Lineal", faculty_id: "f1", faculty_name: "Ingeniería" },
  { id: "s3", name: "Programación Orientada a Objetos", faculty_id: "f1", faculty_name: "Ingeniería" },
  { id: "s4", name: "Estructuras de Datos", faculty_id: "f1", faculty_name: "Ingeniería" },
  { id: "s5", name: "Física Mecánica", faculty_id: "f2", faculty_name: "Ciencias Exactas" },
  { id: "s6", name: "Estadística", faculty_id: "f2", faculty_name: "Ciencias Exactas" },
  { id: "s7", name: "Derecho Constitucional", faculty_id: "f3", faculty_name: "Ciencias Jurídicas" },
];

export const MOCK_PROFILES: Profile[] = [
  {
    id: "mock-001",
    full_name: "Sebastián Martínez",
    bio: "Estudiante de Ingeniería de Sistemas apasionado por el desarrollo móvil.",
    career: "Ingeniería de Sistemas",
    faculty_name: "Ingeniería",
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "mock-002",
    full_name: "Valeria Ospina",
    bio: "Me encanta la matemática y los algoritmos. Busco compañeros para estudiar cálculo.",
    career: "Ingeniería de Sistemas",
    faculty_name: "Ingeniería",
    created_at: "2025-01-20T14:30:00Z",
  },
  {
    id: "mock-003",
    full_name: "Carlos Gómez",
    bio: "Estudiante de 4to semestre, me gusta compartir apuntes y explicar temas.",
    career: "Ingeniería Industrial",
    faculty_name: "Ingeniería",
    created_at: "2025-02-01T09:00:00Z",
  },
  {
    id: "mock-004",
    full_name: "Ana Lucía Ríos",
    bio: "Física y matemáticas son mi pasión. Lista para formar grupos de estudio.",
    career: "Física",
    faculty_name: "Ciencias Exactas y Naturales",
    created_at: "2025-02-10T16:00:00Z",
  },
];

export const MOCK_REQUESTS: StudyRequest[] = [
  {
    id: "r1",
    author_id: "mock-002",
    author: MOCK_PROFILES[1],
    subject_id: "s1",
    subject_name: "Cálculo Diferencial",
    faculty_name: "Ingeniería",
    title: "Grupo de estudio para parcial de Cálculo",
    description:
      "Busco 2-3 compañeros para repasar límites, derivadas y aplicaciones antes del parcial del viernes. Nos reunimos en la biblioteca.",
    max_members: 3,
    modality: "presencial",
    status: "abierta",
    created_at: "2026-02-22T08:00:00Z",
    applications_count: 1,
  },
  {
    id: "r2",
    author_id: "mock-003",
    author: MOCK_PROFILES[2],
    subject_id: "s3",
    subject_name: "Programación Orientada a Objetos",
    faculty_name: "Ingeniería",
    title: "Proyecto final de POO - necesito equipo",
    description:
      "Tenemos que entregar un sistema de gestión en Java. Busco personas que manejen herencia, interfaces y colecciones. El proyecto es para la próxima semana.",
    max_members: 4,
    modality: "virtual",
    status: "abierta",
    created_at: "2026-02-21T20:00:00Z",
    applications_count: 2,
  },
  {
    id: "r3",
    author_id: "mock-004",
    author: MOCK_PROFILES[3],
    subject_id: "s5",
    subject_name: "Física Mecánica",
    faculty_name: "Ciencias Exactas y Naturales",
    title: "Resolución de talleres de Física",
    description:
      "Me gustaría hacer los talleres de cinemática y dinámica en grupo. Tengo todos los apuntes de clase y la bibliografía recomendada.",
    max_members: 5,
    modality: "híbrido",
    status: "abierta",
    created_at: "2026-02-20T15:00:00Z",
    applications_count: 0,
  },
  {
    id: "r4",
    author_id: "mock-002",
    author: MOCK_PROFILES[1],
    subject_id: "s2",
    subject_name: "Álgebra Lineal",
    faculty_name: "Ingeniería",
    title: "Repaso de vectores y matrices",
    description:
      "Voy a repasar transformaciones lineales y valores propios. Si alguien quiere sumarse, puede unirse al grupo de WhatsApp.",
    max_members: 6,
    modality: "virtual",
    status: "abierta",
    created_at: "2026-02-19T11:00:00Z",
    applications_count: 3,
  },
];