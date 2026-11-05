import { supabase } from '../utils/supabase'
import type { Task } from '../types'

export async function fetchTasksByObject(objectId: number): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, email)')
    .eq('object_id', objectId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}

export async function createTask(payload: {
  object_id: number
  title: string
  description?: string
  assignee_id: string
  author_id: string
}): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...payload, status: 'new' })
    .select()
    .single()

  if (error) throw error
  return data as Task
}