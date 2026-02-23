/**
 * store/useAuthStore.ts
 * Estado global de autenticación con Zustand
 * Soporta roles: "estudiante" | "admin"
 */

import { create } from "zustand";

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type UserRole = "estudiante" | "admin";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
}

// ── Mock credentials ──────────────────────────────────────────────────────────
// Eliminar este bloque cuando Supabase esté listo
const IS_MOCK_MODE = true; // ← cambiar a false cuando Supabase esté listo

const MOCK_USERS: Record<string, UserSession & { password: string }> = {
  "estudiante.prueba@ucaldas.edu.co": {
    id: "mock-001",
    email: "estudiante.prueba@ucaldas.edu.co",
    fullName: "Estudiante Prueba",
    role: "estudiante",
    password: "Test1234",
  },
  "admin@ucaldas.edu.co": {
    id: "mock-admin-001",
    email: "admin@ucaldas.edu.co",
    fullName: "Administrador UniConnect",
    role: "admin",
    password: "Admin1234",
  },
};

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // ── Sign In ────────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      if (IS_MOCK_MODE) {
        await new Promise((r) => setTimeout(r, 900));
        const found = MOCK_USERS[email];
        if (!found || found.password !== password) {
          throw new Error("Invalid login credentials");
        }
        const { password: _, ...session } = found;
        set({ user: session, isAuthenticated: true });
        return;
      }

      // ── Producción ────────────────────────────────────────────────────────
      // const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      //
      // // Obtener el rol desde user_metadata o tabla profiles
      // const role = data.user.user_metadata?.role ?? "estudiante";
      //
      // set({
      //   user: {
      //     id: data.user.id,
      //     email: data.user.email!,
      //     fullName: data.user.user_metadata?.full_name ?? "",
      //     avatarUrl: data.user.user_metadata?.avatar_url,
      //     role,
      //   },
      //   isAuthenticated: true,
      // });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign Up ────────────────────────────────────────────────────────────────
  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      if (IS_MOCK_MODE) {
        await new Promise((r) => setTimeout(r, 1000));
        // Simula registro exitoso sin autenticar (debe confirmar correo)
        return;
      }

      // ── Producción ────────────────────────────────────────────────────────
      // const { error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: {
      //     data: {
      //       full_name: fullName,
      //       role: "estudiante", // todos los registros nuevos son estudiantes
      //     },
      //   },
      // });
      // if (error) throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign Out ───────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    try {
      if (IS_MOCK_MODE) {
        await new Promise((r) => setTimeout(r, 300));
        set({ user: null, isAuthenticated: false });
        return;
      }
      // await supabase.auth.signOut();
      // set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));