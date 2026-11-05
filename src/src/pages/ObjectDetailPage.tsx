import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { updateObject, deleteObject } from '../api/objects'
import { useAuthStore } from '../store/authStore'
import type { ObjectItem } from '../types'

export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const isManager = profile?.role === 'manager'

  const [object, setObject] = useState<ObjectItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    load()
  }, [id])

  const load = async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('objects')
      .select('*')
      .eq('id', Number(id))
      .single()

    if (error) {
      setError(error.message)
    } else {
      setObject(data as ObjectItem)
      setName(data.name)
      setAddress(data.address ?? '')
    }
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!object) return
    try {
      const updated = await updateObject(object.id, {
        name,
        address: address || null,
      })
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

  if (loading) return <div className="p-8">Загрузка...</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!object) return <div className="p-8">Объект не найден</div>

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{object.name}</h1>
        {isManager && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((v) => !v)}
              className="border rounded-lg px-4 py-2 text-sm"
            >
              {editing ? 'Отмена' : 'Редактировать'}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white rounded-lg px-4 py-2 text-sm"
            >
              Удалить
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white border rounded-lg p-4 flex flex-col gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded px-3 py-2 text-sm"
            placeholder="Название"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
            placeholder="Адрес"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start">
            Сохранить
          </button>
        </form>
      ) : (
        object.address && <p className="text-gray-600 mb-4">{object.address}</p>
      )}

      <h2 className="text-lg font-medium mb-2">Задачи</h2>
      <p className="text-sm text-gray-500">Список задач (скоро)</p>
    </div>
  )
}