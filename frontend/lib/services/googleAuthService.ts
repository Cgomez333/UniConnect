import { supabase } from "@/lib/supabase"
import { useCallback, useState } from "react"
import * as WebBrowser from "expo-web-browser"
import * as AuthSession from "expo-auth-session"
import Constants from "expo-constants"

WebBrowser.maybeCompleteAuthSession()

const ALLOWED_DOMAIN = "ucaldas.edu.co"

/**
 * Generates the appropriate OAuth redirect URL based on app environment.
 * Uses exp:// for Expo Go and custom scheme for native builds.
 */
function getOAuthRedirectUrl() {
  // In Expo Go/guest, use direct exp:// deep link.
  if (Constants.appOwnership === "expo" || Constants.appOwnership === "guest") {
    return AuthSession.makeRedirectUri({ path: "oauth-callback" })
  }

  // Native builds use the app scheme.
  return AuthSession.makeRedirectUri({
    scheme: "com.juanse108.uniconnet",
    path: "oauth-callback",
  })
}

/**
 * Hook for managing Google OAuth authentication flow via Supabase.
 * Enforces @ucaldas.edu.co domain restriction.
 * 
 * @returns {{loading: boolean, error: string | null, signInWithGoogle: () => Promise<void>}}
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createSessionFromUrl = useCallback(async (url: string) => {
    try {
      const queryParams = extractQueryParams(url)
      const hashParams = extractHashParams(url)

      if (queryParams.code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryParams.code)
        if (exchangeError) throw exchangeError

        setLoading(false)
        return
      }

      if (hashParams.access_token && hashParams.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: hashParams.access_token,
          refresh_token: hashParams.refresh_token,
        })
        if (sessionError) throw sessionError

        setLoading(false)
        return
      }

      setLoading(false)
    } catch (e: any) {
      setError(`Error: ${e.message}`)
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const redirectUrl = getOAuthRedirectUrl()

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            hd: ALLOWED_DOMAIN,
          },
          skipBrowserRedirect: true,
        },
      })

      if (oauthError) throw oauthError
      if (!data.url) throw new Error("No se recibió URL de autenticación")

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

      if (result.type === "success" && result.url) {
        await createSessionFromUrl(result.url)
      } else {
        setLoading(false)
      }

    } catch (e: any) {
      setError(`Error: ${e.message}`)
      setLoading(false)
    }
  }, [createSessionFromUrl])

  return { loading, error, signInWithGoogle }
}

/**
 * Extracts query parameters from URL.
 */
function extractQueryParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const questionIndex = url.indexOf("?")
  if (questionIndex === -1) return params

  let queryString = url.substring(questionIndex + 1)
  const hashIndex = queryString.indexOf("#")
  if (hashIndex !== -1) queryString = queryString.substring(0, hashIndex)

  for (const pair of queryString.split("&")) {
    const [key, value] = pair.split("=")
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  }
  return params
}

/**
 * Extracts hash fragment parameters from URL.
 */
function extractHashParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const hashIndex = url.indexOf("#")
  if (hashIndex === -1) return params

  const hash = url.substring(hashIndex + 1)
  for (const pair of hash.split("&")) {
    const [key, value] = pair.split("=")
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value)
    }
  }
  return params
}