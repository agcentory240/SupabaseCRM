import { supabase } from '../utils/supabase'
import type { Task, TaskHistoryItem, TaskStatus } from '../types'

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

export async function fetchTaskById(id: number): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, email)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Task
}

export async function fetchTaskHistory(taskId: number): Promise<TaskHistoryItem[]> {
  const { data, error } = await supabase
    .from('task_history')
    .select('*')
    .eq('task_id', taskId)
    .order('changed_at', { ascending: true })

  if (error) throw error
  return data as TaskHistoryItem[]
}

export async function changeTaskStatus(
  taskId: number,
  newStatus: TaskStatus,
  comment?: string,
): Promise<void> {
  const { error } = await supabase.rpc('change_task_status', {
    p_task_id: taskId,
    p_new_status: newStatus,
    p_comment: comment ?? null,
  })

  if (error) throw error
}

export async function fetchMyTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('tasks')
    .select('*, assignee:profiles!tasks_assignee_id_fkey(id, email)')
    .eq('assignee_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}