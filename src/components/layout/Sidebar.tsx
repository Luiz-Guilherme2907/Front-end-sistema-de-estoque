import { useState, useRef, useLayoutEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ArrowLeftRight, LogOut, Sun, Moon, UserCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

type DockItem = {
  to?: string
  icon: LucideIcon
  label: string
  onClick?: () => void
  danger?: boolean
}

const navItems: DockItem[] = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/produtos',       icon: Package,         label: 'Produtos' },
  { to: '/movimentacoes',  icon: ArrowLeftRight,  label: 'Movimentações' },
  { to: '/perfil',         icon: UserCircle,      label: 'Perfil' },
  { icon: LogOut,          label: 'Sair',         danger: true },
]

export function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const activeIndex = navItems.findIndex(item => item.to && location.pathname.startsWith(item.to))

  navItems[navItems.length - 1].onClick = () => { signOut(); navigate('/login') }

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const spotRef  = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const spot   = spotRef.current
    const active = itemRefs.current[activeIndex]
    if (!spot || !active || activeIndex < 0) return
    const newLeft = active.offsetLeft + active.offsetWidth / 2 - spot.offsetWidth / 2
    spot.style.left = `${newLeft}px`
    if (!ready) setTimeout(() => setReady(true), 50)
  }, [activeIndex, ready])

  const amber = 'hsl(var(--amber))'
  const card  = 'hsl(var(--card))'
  const border = 'hsl(var(--border))'
  const muted = 'hsl(var(--muted-foreground))'
  const destructive = 'hsl(var(--destructive))'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <nav
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          height: '64px',
          background: card,
          border: `1px solid ${border}`,
          borderRadius: '16px',
          padding: '0 8px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          style={{
            position: 'relative',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            borderRight: `1px solid ${border}`,
            marginRight: '4px',
            paddingRight: '4px',
            cursor: 'pointer',
            color: muted,
            opacity: 0.5,
            transition: 'opacity 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '0.5')}
        >
          {theme === 'dark' ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>

        {navItems.map(({ to, icon: Icon, label, onClick, danger }, index) => {
          const isActive = index === activeIndex
          const color = danger ? destructive : isActive ? amber : muted

          return (
            <button
              key={label}
              ref={el => (itemRefs.current[index] = el)}
              onClick={onClick ?? (() => to && navigate(to))}
              title={label}
              style={{
                position: 'relative',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '100%',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color,
                opacity: isActive || danger ? 1 : 0.5,
                transition: 'opacity 0.15s ease, color 0.15s ease',
                borderLeft: danger ? `1px solid ${border}` : 'none',
                marginLeft: danger ? '4px' : 0,
                paddingLeft: danger ? '4px' : 0,
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.opacity = '0.85'
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.opacity = danger ? '1' : '0.5'
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          )
        })}

        {/* Limelight spot */}
        {activeIndex >= 0 && (
          <div
            ref={spotRef}
            style={{
              position: 'absolute',
              top: 0,
              left: '-999px',
              width: '44px',
              height: '4px',
              borderRadius: '0 0 4px 4px',
              background: amber,
              boxShadow: `0 0 20px 4px ${amber}`,
              zIndex: 10,
              transition: ready ? 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            }}
          >
            {/* Cone glow */}
            <div
              style={{
                position: 'absolute',
                left: '-30%',
                top: '4px',
                width: '160%',
                height: '52px',
                clipPath: 'polygon(5% 100%, 25% 0, 75% 0, 95% 100%)',
                background: `linear-gradient(to bottom, ${amber}30, transparent)`,
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
      </nav>
    </div>
  )
}
