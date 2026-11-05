import { Link } from 'react-router-dom'
import type { Task } from '../types'
import { StatusBadge } from './StatusBadge'

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-white border rounded-lg p-4 hover:shadow transition"
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      {task.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Исполнитель: {task.assignee?.email ?? 'не назначен'}
      </p>
    </Link>
  )
}