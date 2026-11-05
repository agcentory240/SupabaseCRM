import { supabase } from '../utils/supabase'
import type { ObjectItem } from '../types'

export async function fetchObjects(): Promise<ObjectItem[]> {
  const { data, error } = await supabase
    .from('objects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ObjectItem[]
}

export async function createObject(payload: { name: string; address?: string }): Promise<ObjectItem> {
  const { data, error } = await supabase
    .from('objects')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as ObjectItem
}