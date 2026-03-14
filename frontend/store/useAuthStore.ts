import {
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

interface ProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  semester: number | null;
  bio: string | null;
}

const buildFallbackUser = (sessionUser: any): UserSession => ({
  id: sessionUser.id,
  email: sessionUser.email!,
  fullName: sessionUser.user_metadata?.full_name ?? "Estudiante",
  avatarUrl: sessionUser.user_metadata?.avatar_url ?? null,
  phoneNumber: null,
  role: "estudiante",
  semester: null,
  bio: null,
});

const normalizeEmail = (email?: string | null) => email?.toLowerCase() ?? "";

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallbackValue: T
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race<T>([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => resolve(fallbackValue), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const fetchProfileByUserId = async (userId: string): Promise<ProfileRow | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, semester, bio")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.warn("[authStore] No se pudo obtener perfil completo:", error);
    return null;
  }

  return data;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isHydrating: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  initialize: () => {
    const processSession = async (session: any) => {
      if (session?.user) {
        const fallbackUser = buildFallbackUser(session.user);
        try {
          const email = normalizeEmail(session.user.email);

          if (!email?.endsWith('@ucaldas.edu.co')) {
            console.warn("[authStore] Usuario rechazado: no es de ucaldas.edu.co -", email);
            await supabase.auth.signOut();
            set({ user: null, isAuthenticated: false, isHydrating: false });
            return;
          }

          // No bloquear navegación por una consulta lenta de perfil.
          set({
            user: fallbackUser,
            isAuthenticated: true,
            isHydrating: false,
          });

          registerAndSavePushToken(session.user.id).catch(() => {});

          const profile = await withTimeout<ProfileRow | null>(
            fetchProfileByUserId(session.user.id),
            3500,
            null
          );

          if (profile) {
            set((state) => {
              if (!state.user || state.user.id !== session.user.id) return state;
              return {
                ...state,
                user: {
                  ...state.user,
                  fullName: profile.full_name,
                  avatarUrl: profile.avatar_url,
                  role: profile.role,
                  semester: profile.semester,
                  bio: profile.bio,
                },
              };
            });
          }
        } catch (error) {
          console.warn("[authStore] Error al procesar sesión:", error);
          set({
            user: fallbackUser,
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
      if (event === "SIGNED_OUT") {
        set({ user: null, isAuthenticated: false, isHydrating: false });
        return;
      }

      // En OAuth (Google) pueden llegar eventos distintos a SIGNED_IN
      // como INITIAL_SESSION o TOKEN_REFRESHED con sesión ya válida.
      if (session?.user) {
        await processSession(session);
      }
    });

    return () => subscription.unsubscribe();
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user } = await sbSignIn({ email, password });
      if (!user) throw new Error("No se pudo iniciar sesión");

      const fallbackUser = buildFallbackUser(user);
      set({
        user: fallbackUser,
        isAuthenticated: true,
      });

      const profile = await withTimeout<ProfileRow | null>(
        fetchProfileByUserId(user.id),
        3500,
        null
      );

      if (profile) {
        set((state) => {
          if (!state.user || state.user.id !== user.id) return state;
          return {
            ...state,
            user: {
              ...state.user,
              fullName: profile.full_name,
              avatarUrl: profile.avatar_url,
              role: profile.role,
              semester: profile.semester,
              bio: profile.bio,
            },
          };
        });
      }

      registerAndSavePushToken(profile?.id ?? user.id).catch(() => {});
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