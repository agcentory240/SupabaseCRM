import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { updateObject, deleteObject } from '../api/objects'
import { fetchTasksByObject, createTask } from '../api/tasks'
import { fetchWorkers } from '../api/profiles'
import { useAuthStore } from '../store/authStore'
import { TaskCard } from '../components/TaskCard'
import type { ObjectItem, Task, Profile } from '../types'

export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const isManager = profile?.role === 'manager'

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Pick<Profile, 'id' | 'email'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('')

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('id', Number(id))
        .single()
      if (error) throw error
      setObject(data as ObjectItem)
      setName(data.name)
      setAddress(data.address ?? '')

      const tasksData = await fetchTasksByObject(Number(id))
      setTasks(tasksData)

      if (isManager) {
        const workersData = await fetchWorkers()
        setWorkers(workersData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!object) return
    try {
      const updated = await updateObject(object.id, { name, address: address || null })
      setObject(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить')
    }
  }

  const handleDelete = async () => {
    if (!object) return
    if (!confirm(`Удалить объект «${object.name}»? Все его задачи тоже удалятся.`)) return
    try {
      await deleteObject(object.id)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!object || !user || !taskTitle.trim() || !taskAssignee) return
    try {
      await createTask({
        object_id: object.id,
        title: taskTitle,
        description: taskDescription || undefined,
        assignee_id: taskAssignee,
        author_id: user.id,
      })
      setTaskTitle('')
      setTaskDescription('')
      setTaskAssignee('')
      setShowTaskForm(false)
      const tasksData = await fetchTasksByObject(object.id)
      setTasks(tasksData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать задачу')
    }
  }

  if (loading) return <div className="p-8">Загрузка...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!object) return <div className="p-8">Объект не найден</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{object.name}</h1>
        {isManager && (
          <div className="flex gap-2">
            <button onClick={() => setEditing((v) => !v)} className="border rounded-lg px-4 py-2 text-sm">
              {editing ? 'Отмена' : 'Редактировать'}
            </button>
            <button onClick={handleDelete} className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm">
              Удалить
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white border rounded-lg p-4 flex flex-col gap-2 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} required className="border rounded px-3 py-2 text-sm" placeholder="Название" />
          <input value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded px-3 py-2 text-sm" placeholder="Адрес" />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start">Сохранить</button>
        </form>
      ) : (
        object.address && <p className="text-gray-600 mb-4">{object.address}</p>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-medium">Задачи</h2>
        {isManager && (
          <button onClick={() => setShowTaskForm((v) => !v)} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm">
            {showTaskForm ? 'Отмена' : 'Создать задачу'}
          </button>
        )}
      </div>

      {showTaskForm && (
        <form onSubmit={handleCreateTask} className="bg-white border rounded-lg p-4 flex flex-col gap-2 mb-4">
          <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required placeholder="Название задачи" className="border rounded px-3 py-2 text-sm" />
          <textarea value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Описание (опционально)" className="border rounded px-3 py-2 text-sm" rows={3} />
          <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} required className="border rounded px-3 py-2 text-sm">
            <option value="">Выберите исполнителя</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.email}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start">Создать</button>
        </form>
      )}

      {tasks.length === 0 ? (
        <p className="text-gray-500 text-sm">Пока нет задач</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
    </div>
  )
}