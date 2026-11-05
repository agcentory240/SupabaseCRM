import { useEffect, useState } from 'react'
import { fetchMyTasks } from '../api/tasks'
import { TaskCard } from '../components/TaskCard'
import type { Task } from '../types'

export function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMyTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить задачи')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Мои задачи</h1>
      {loading && <p className="text-gray-500">Загрузка...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && tasks.length === 0 && <p className="text-gray-500">Пока нет задач</p>}
      <div className="flex flex-col gap-3">
        {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
    </div>
  )
}