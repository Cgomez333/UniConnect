/**
 * store/useAuthStore.ts
 * Estado global de autenticación con Zustand
 * Incluye mock para desarrollo sin Supabase
 */

import { create } from "zustand";

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Acciones
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
}

// ── Mock credentials (solo para desarrollo) ───────────────────────────────────
// Eliminar este bloque cuando Supabase esté listo
const MOCK_USER: UserSession = {
  id: "mock-001",
  email: "estudiante.prueba@ucaldas.edu.co",
  fullName: "Estudiante Prueba",
};

const MOCK_CREDENTIALS = {
  email: "estudiante.prueba@ucaldas.edu.co",
  password: "Test1234",
};

const IS_MOCK_MODE = true; // ← cambiar a false cuando Supabase esté listo

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  // ── Sign In ────────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true });

    try {
      if (IS_MOCK_MODE) {
        // ── Modo mock ──────────────────────────────────────────────────────
        await new Promise((r) => setTimeout(r, 800)); // simula latencia

        if (
          email === MOCK_CREDENTIALS.email &&
          password === MOCK_CREDENTIALS.password
        ) {
          set({ user: MOCK_USER, isAuthenticated: true });
        } else {
          throw new Error("Invalid login credentials");
        }
        return;
      }

      // ── Producción: descomentar cuando Supabase esté listo ────────────────
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password,
      // });
      // if (error) throw error;
      // set({
      //   user: {
      //     id: data.user.id,
      //     email: data.user.email!,
      //     fullName: data.user.user_metadata?.full_name ?? "",
      //     avatarUrl: data.user.user_metadata?.avatar_url,
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
        // ── Modo mock: simula registro exitoso ─────────────────────────────
        await new Promise((r) => setTimeout(r, 1000));
        // No autenticamos directo → el usuario debe confirmar correo
        // En mock simplemente "completamos" sin error
        return;
      }

      // ── Producción ────────────────────────────────────────────────────────
      // const { error } = await supabase.auth.signUp({
      //   email,
      //   password,
      //   options: { data: { full_name: fullName } },
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

      // ── Producción ────────────────────────────────────────────────────────
      // await supabase.auth.signOut();
      // set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));