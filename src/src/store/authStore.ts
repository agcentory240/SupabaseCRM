import { create } from 'zustand'
import { supabase } from '../utils/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: { id: string; email: string } | null
  profile: Profile | null
  loading: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,   //данные из Supabase Auth
  profile: null,    //таблица profiles
  loading: true,    //флаг, что идёт загрузка

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      set({
        user: { id: session.user.id, email: session.user.email ?? '' },
        profile: profile as Profile | null,
        loading: false,
      })
    } else {
      set({ user: null, profile: null, loading: false })
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await useAuthStore.getState().init()
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))