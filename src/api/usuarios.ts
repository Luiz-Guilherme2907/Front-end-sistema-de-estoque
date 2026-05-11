import api from './client'

export interface UsuarioMe {
  id: number
  nome: string
  email: string
  role: string
}

export async function getMe(): Promise<UsuarioMe> {
  const { data } = await api.get<UsuarioMe>('/api/usuarios/me')
  return data
}
