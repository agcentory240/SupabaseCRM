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

export async function updateObject(
  id: number,
  payload: { name: string; address?: string | null },
): Promise<ObjectItem> {
  const { data, error } = await supabase
    .from('objects')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ObjectItem
}

export async function deleteObject(id: number): Promise<void> {
  const { error } = await supabase
    .from('objects')
    .delete()
    .eq('id', id)

  if (error) throw error
}