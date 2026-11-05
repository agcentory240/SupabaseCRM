import type { TaskStatus } from '../types'
import { STATUS_COLORS, STATUS_LABELS } from '../constants/statuses'

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
