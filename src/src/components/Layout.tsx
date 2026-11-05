import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex gap-4 items-center">
        <Link to="/" className="font-semibold">
          SupabaseCRM
        </Link>
        <Link to="/" className="text-sm text-gray-600 hover:text-black">
          Объекты
        </Link>
        <Link to="/my-tasks" className="text-sm text-gray-600 hover:text-black">
          Мои задачи
        </Link>
      </header>
      <main>{children}</main>
    </div>
  )
}
