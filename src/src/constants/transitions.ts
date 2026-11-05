import type { Role, TaskStatus } from '../types'

export const ALLOWED_TRANSITIONS: Record<
  TaskStatus,
  { to: TaskStatus; role: Role; label: string; requiresComment?: boolean }[]
> = {
  new: [
    { to: 'in_progress', role: 'worker', label: 'Взять в работу' },
  ],
  in_progress: [
    { to: 'on_review', role: 'worker', label: 'Отправить на проверку' },
  ],
  on_review: [
    { to: 'accepted', role: 'manager', label: 'Принять' },
    { to: 'needs_rework', role: 'manager', label: 'На доработку', requiresComment: true },
  ],
  needs_rework: [
    { to: 'in_progress', role: 'worker', label: 'Взять в работу' },
  ],
  accepted: [],
}