export type Role = 'manager' | 'worker'

export type TaskStatus =
  | 'new'
  | 'in_progress'
  | 'on_review'
  | 'accepted'
  | 'needs_rework'

export interface Profile {
  id: string
  email: string
  role: Role
}

export interface ObjectItem {
  id: number
  name: string
  address: string | null
  created_at: string
}

export interface Task {
  id: number
  object_id: number
  title: string
  description: string | null
  assignee_id: string | null
  status: TaskStatus
  author_id: string | null
  created_at: string
  assignee?: { id: string; email: string } | null
}

export interface TaskHistoryItem {
  id: number
  task_id: number
  from_status: TaskStatus | null
  to_status: TaskStatus
  comment: string | null
  changed_by: string | null
  changed_at: string
}