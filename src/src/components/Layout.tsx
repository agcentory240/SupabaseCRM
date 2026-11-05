import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function Layout({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex gap-4 items-center">
        <Link to="/" className="font-semibold">SupabaseCRM</Link>
        <Link to="/" className="text-sm text-gray-600 hover:text-black">Объекты</Link>
        {profile?.role === 'worker' && (
          <Link to="/my-tasks" className="text-sm text-gray-600 hover:text-black">Мои задачи</Link>
        )}
        <button
          onClick={handleLogout}
          className="ml-auto text-sm text-gray-600 hover:text-black cursor-pointer"
        >
          Выйти
        </button>
      </header>
      <main>{children}</main>
    </div>
  )
}