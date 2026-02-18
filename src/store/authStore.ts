import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean

  initialize: () => Promise<void>
  signInWithGoogle: (googleToken: string, nonce?: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return

    // Playwright test mode: mock user injected via __PLAYWRIGHT_MOCK_USER__
    if (typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_MOCK_USER__) {
      set({ user: (window as any).__PLAYWRIGHT_MOCK_USER__, loading: false, initialized: true })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session, user: session?.user ?? null, loading: false, initialized: true })

      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user ?? null, loading: false })
      })
    } catch (err) {
      console.error('Auth init error:', err)
      set({ loading: false, initialized: true })
    }
  },

  signInWithGoogle: async (googleToken: string, nonce?: string) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: googleToken,
        nonce, // required for Supabase to verify the token
      })
      if (error) throw error
      set({ session: data.session, user: data.user, loading: false })
    } catch (err) {
      set({ loading: false })
      throw err
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  },
}))
