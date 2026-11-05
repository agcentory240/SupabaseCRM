import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchTaskById, fetchTaskHistory, changeTaskStatus } from '../api/tasks'
import { useAuthStore } from '../store/authStore'
import { StatusBadge } from '../components/StatusBadge'
import { ALLOWED_TRANSITIONS } from '../constants/transitions'
import { STATUS_LABELS } from '../constants/statuses'
import type { Task, TaskHistoryItem, TaskStatus } from '../types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const profile = useAuthStore((s) => s.profile)

  const [task, setTask] = useState<Task | null>(null)
  const [history, setHistory] = useState<TaskHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [pendingStatus, setPendingStatus] = useState<TaskStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const [taskData, historyData] = await Promise.all([
        fetchTaskById(Number(id)),
        fetchTaskHistory(Number(id)),
      ])
      setTask(taskData)
      setHistory(historyData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const handleTransition = async (to: TaskStatus, requiresComment?: boolean) => {
    if (!task) return
    if (requiresComment && !comment.trim()) {
      setError('Комментарий обязателен')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await changeTaskStatus(task.id, to, comment || undefined)
      setComment('')
      setPendingStatus(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сменить статус')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!task) return <div className="p-8">Задача не найдена</div>

  const role = profile?.role
  const transitions = ALLOWED_TRANSITIONS[task.status].filter(
    (t) => t.role === role &&
      (role !== 'worker' || task.assignee_id === profile?.id)
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <StatusBadge status={task.status} />
      </div>
      {task.description && <p className="text-gray-700 mb-4">{task.description}</p>}
      <p className="text-sm text-gray-500 mb-6">
        Исполнитель: {task.assignee?.email ?? 'не назначен'}
      </p>

      {transitions.length > 0 && (
        <div className="bg-white border rounded-lg p-4 mb-6 flex flex-col gap-2">
          <h2 className="font-medium">Действия</h2>
          {transitions.map((t) => (
            <div key={t.to} className="flex flex-col gap-1">
              {pendingStatus === t.to ? (
                <div className="flex flex-col gap-2">
                  {t.requiresComment && (
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Комментарий (обязательно)"
                      className="border rounded px-3 py-2 text-sm"
                      rows={3}
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTransition(t.to, t.requiresComment)}
                      disabled={submitting}
                      className="bg-blue-600 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
                    >
                      Подтвердить
                    </button>
                    <button
                      onClick={() => { setPendingStatus(null); setComment(''); setError(null) }}
                      className="border rounded px-4 py-2 text-sm"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setPendingStatus(t.to)}
                  className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start"
                >
                  {t.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-medium mb-2">История</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-500">История пуста</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {history.map((h) => (
            <li key={h.id} className="bg-white border rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span>
                  {h.from_status ? `${STATUS_LABELS[h.from_status]} → ` : ''}
                  <strong>{STATUS_LABELS[h.to_status]}</strong>
                </span>
                <span className="text-gray-500">
                  {new Date(h.changed_at).toLocaleString('ru-RU')}
                </span>
              </div>
              {h.comment && <p className="text-gray-600 mt-1">«{h.comment}»</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}