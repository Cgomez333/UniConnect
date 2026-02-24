/**
 * store/useAuthStore.ts
 * Estado global de autenticación con Zustand
 * Conectado a Supabase real via authService
 */

import {
  getMyProfile,
  onAuthStateChange,
  signIn as sbSignIn,
  signOut as sbSignOut,
  signUp as sbSignUp,
} from "@/lib/services/authService";
import { create } from "zustand";

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type UserRole = "estudiante" | "admin";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: UserRole;
  semester?: number | null;
  bio?: string | null;
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
  initialize: () => () => void; // retorna el unsubscribe para usarlo en el layout
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // ── Inicializar: escucha cambios de sesión de Supabase ─────────────────────
  // Llamar esto en el layout raíz una sola vez al arrancar la app
  initialize: () => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Buscar el perfil completo en la tabla profiles
          const profile = await getMyProfile();
          if (profile) {
            set({
              user: {
                id: profile.id,
                email: session.user.email!,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                role: profile.role as UserRole,
                semester: profile.semester,
                bio: profile.bio,
              },
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error("Error cargando perfil:", error);
        }
      }

      if (event === "SIGNED_OUT") {
        set({ user: null, isAuthenticated: false });
      }
    });

    // Retornar la función de limpieza para usarla en useEffect
    return () => subscription.unsubscribe();
  },

  // ── Sign In ────────────────────────────────────────────────────────────────
  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      // 1. Autenticar con Supabase
      const { user } = await sbSignIn({ email, password });
      if (!user) throw new Error("No se pudo iniciar sesión");

      // 2. Obtener el perfil completo de la tabla profiles
      const profile = await getMyProfile();
      if (!profile) throw new Error("No se encontró el perfil del usuario");

      // 3. Guardar en el store
      set({
        user: {
          id: profile.id,
          email: user.email!,
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          role: profile.role as UserRole,
          semester: profile.semester,
          bio: profile.bio,
        },
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign Up ────────────────────────────────────────────────────────────────
  // El trigger handle_new_user en Supabase crea el perfil automáticamente
  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      await sbSignUp({ email, password, fullName });
      // No autenticamos aquí — el usuario debe confirmar su correo
      // Si tienes la confirmación desactivada en Supabase,
      // puedes llamar signIn() directamente después
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Sign Out ───────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ isLoading: true });
    try {
      await sbSignOut();
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },
}));