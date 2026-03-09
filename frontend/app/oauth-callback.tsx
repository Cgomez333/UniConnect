import { SplashLoader } from "@/components/ui/SplashLoader";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function OAuthCallbackScreen() {
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [waitExpired, setWaitExpired] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWaitExpired(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/(admin)" as any);
      } else {
        router.replace("/(tabs)" as any);
      }
      return;
    }

    if (isHydrating || !waitExpired) return;

    router.replace("/login" as any);
  }, [isHydrating, isAuthenticated, user, waitExpired]);

  return <SplashLoader message="Iniciando sesión..." />;
}
