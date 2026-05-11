import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import SpotlightBackground from '@/components/ui/spotlight-background'

export function AppLayout() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <SpotlightBackground>
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '36px 40px 120px',
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </main>
      </SpotlightBackground>
      <Sidebar />
    </div>
  )
}
