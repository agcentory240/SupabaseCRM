import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './src/store/authStore'
import { Layout } from './src/components/Layout'
import { LoginPage } from './src/pages/LoginPage'
import { ObjectsPage } from './src/pages/ObjectsPage'
import { ObjectDetailPage } from './src/pages/ObjectDetailPage'
import { TaskDetailPage } from './src/pages/TaskDetailPage'
import { MyTasksPage } from './src/pages/MyTasksPage'

function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return <div className="p-8">Загрузка...</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout>
                <ObjectsPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/objects/:id"
          element={
            <RequireAuth>
              <Layout>
                <ObjectDetailPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <RequireAuth>
              <Layout>
                <TaskDetailPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/my-tasks"
          element={
            <RequireAuth>
              <Layout>
                <MyTasksPage />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
