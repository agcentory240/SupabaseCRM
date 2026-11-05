import { supabase } from '../utils/supabase'
import type { Profile } from '../types'

export async function fetchWorkers(): Promise<Pick<Profile, 'id' | 'email'>[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'worker')

  if (error) throw error
  return data ?? []
}