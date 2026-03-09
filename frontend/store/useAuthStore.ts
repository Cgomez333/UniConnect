import {
  getMyProfile,
  onAuthStateChange,
  signIn as sbSignIn,
  signOut as sbSignOut,
  signUp as sbSignUp,
} from "@/lib/services/authService";
import { registerAndSavePushToken } from "@/lib/services/pushService";
import { supabase } from "@/lib/supabase";
import { create } from "zustand";

export type UserRole = "estudiante" | "admin";

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
  semester?: number | null;
  bio?: string | null;
}

interface AuthState {
  user: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isHydrating: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: UserSession | null) => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isHydrating: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  initialize: () => {
    const processSession = async (session: any) => {
      if (session?.user) {
        try {
          const email = session.user.email?.toLowerCase();

          if (!email?.endsWith('@ucaldas.edu.co')) {
            console.warn("[authStore] Usuario rechazado: no es de ucaldas.edu.co -", email);
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false, isHydrating: false });
            return;
          }

          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              fullName: session.user.user_metadata?.full_name ?? "Estudiante",
              avatarUrl: session.user.user_metadata?.avatar_url ?? null,
              phoneNumber: null,
              role: "estudiante",
              semester: null,
              bio: null,
            },
            isAuthenticated: true,
            isHydrating: false,
          });

          getMyProfile()
            .then((profile) => {
              if (profile) {
                set((state) => ({
                  user: state.user ? {
                    ...state.user,
                    fullName: profile.full_name,
                    avatarUrl: profile.avatar_url,
                    role: profile.role,
                    semester: profile.semester,
                    bio: profile.bio,
                  } : null,
                }));
              }
            })
            .catch((error) => {
              console.warn("[authStore] No se pudo obtener perfil completo:", error);
            });

          registerAndSavePushToken(session.user.id).catch(() => {});
        } catch (error) {
          console.warn("[authStore] Error al procesar sesión:", error);
          set({
            user: {
              id: session.user.id,
              email: session.user.email!,
              fullName: session.user.user_metadata?.full_name ?? "Estudiante",
              avatarUrl: session.user.user_metadata?.avatar_url ?? null,
              phoneNumber: null,
              role: "estudiante",
              semester: null,
              bio: null,
            },
            isAuthenticated: true,
            isHydrating: false,
          });
        }
      } else {
        set({ user: null, isAuthenticated: false, isHydrating: false });
      }
    };

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        await processSession(session);
      } catch (error) {
        console.error("[authStore] Error al verificar sesión inicial:", error);
        set({ user: null, isAuthenticated: false, isHydrating: false });
      }
    })();

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN") {
        await processSession(session);
      }
      if (event === "SIGNED_OUT") {
        set({ user: null, isAuthenticated: false, isHydrating: false });
      }
    });

    return () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user } = await sbSignIn({ email, password });
      if (!user) throw new Error("No se pudo iniciar sesión");

      set({
        user: {
          id: user.id!,
          email: user.email!,
          fullName: user.user_metadata?.full_name ?? "Estudiante",
          avatarUrl: user.user_metadata?.avatar_url ?? null,
          phoneNumber: null,
          role: "estudiante",
          semester: null,
          bio: null,
        },
        isAuthenticated: true,
      });

      getMyProfile()
        .then((profile) => {
          if (profile) {
            set((state) => ({
              user: state.user ? {
                ...state.user,
                fullName: profile.full_name,
                avatarUrl: profile.avatar_url,
                role: profile.role,
                semester: profile.semester,
                bio: profile.bio,
              } : null,
            }));
            registerAndSavePushToken(profile.id).catch(() => {});
          }
        })
        .catch(() => {
          console.warn("[authStore] No se pudo obtener perfil completo (continuando)");
        });
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      await sbSignUp({ email, password, fullName });
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