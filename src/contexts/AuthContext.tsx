import { createContext, useContext, useState, type ReactNode } from 'react'
import type { AuthResponse } from '@/types'

interface AuthUser {
  token: string
  email: string
  role: string
}

interface AuthContextType {
  user: AuthUser | null
  signIn: (data: AuthResponse) => void
  signOut: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const signIn = (data: AuthResponse) => {
    const u: AuthUser = { token: data.token, email: data.email, role: data.role }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const signOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
