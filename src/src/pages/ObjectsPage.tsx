import { useEffect, useState } from 'react'
import { fetchObjects, createObject } from '../api/objects'
import { ObjectCard } from '../components/ObjectCard'
import { useAuthStore } from '../store/authStore'
import type { ObjectItem } from '../types'

export function ObjectsPage() {
  const [objects, setObjects] = useState<ObjectItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const profile = useAuthStore((s) => s.profile)
  const isManager = profile?.role === 'manager'

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchObjects()
      setObjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объекты')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createObject({ name, address: address || undefined })
      setName('')
      setAddress('')
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать объект')
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Объекты</h1>
        {isManager && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm"
          >
            {showForm ? 'Отмена' : 'Создать объект'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border rounded-lg p-4 mb-4 flex flex-col gap-2">
          <input
            placeholder="Название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border rounded px-3 py-2 text-sm"
          />
          <input
            placeholder="Адрес (опционально)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 text-sm self-start">
            Сохранить
          </button>
        </form>
      )}

      {loading && <p className="text-gray-500">Загрузка...</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {!loading && objects.length === 0 && <p className="text-gray-500">Пока нет объектов</p>}

      <div className="flex flex-col gap-3">
        {objects.map((o) => <ObjectCard key={o.id} object={o} />)}
      </div>
    </div>
  )
}