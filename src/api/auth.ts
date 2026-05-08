import api from './client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types'

export const login = (data: LoginRequest) =>
  api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data)

export const registrar = (data: RegisterRequest) =>
  api.post<AuthResponse>('/api/auth/registrar', data).then((r) => r.data)
