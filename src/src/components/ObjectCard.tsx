import { Link } from 'react-router-dom'
import type { ObjectItem } from '../types'

export function ObjectCard({ object }: { object: ObjectItem }) {
  return (
    <Link
      to={`/objects/${object.id}`}
      className="block bg-white border rounded-lg p-4 hover:shadow transition"
    >
      <h3 className="font-medium">{object.name}</h3>
      {object.address && <p className="text-sm text-gray-600 mt-1">{object.address}</p>}
    </Link>
  )
}
