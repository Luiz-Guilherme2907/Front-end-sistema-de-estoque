import api from './client'
import type { MovimentacaoRequest, MovimentacaoResponse, Page } from '@/types'

export const listarMovimentacoes = (produtoId: number, page = 0, size = 20) =>
  api
    .get<Page<MovimentacaoResponse>>(`/api/movimentacoes/produto/${produtoId}`, {
      params: { page, size },
    })
    .then((r) => r.data)

export const registrarMovimentacao = (data: MovimentacaoRequest) =>
  api.post<MovimentacaoResponse>('/api/movimentacoes', data).then((r) => r.data)

export interface HistoricoFiltros {
  produtoId?: number
  tipo?: 'ENTRADA' | 'SAIDA' | ''
  de?: string
  ate?: string
  page?: number
  size?: number
  sort?: string
}

export const listarHistorico = (filtros: HistoricoFiltros = {}) => {
  const params: Record<string, unknown> = {
    page: filtros.page ?? 0,
    size: filtros.size ?? 20,
    sort: filtros.sort ?? 'criadoEm,desc',
  }
  if (filtros.produtoId) params.produtoId = filtros.produtoId
  if (filtros.tipo) params.tipo = filtros.tipo
  if (filtros.de) params.de = filtros.de
  if (filtros.ate) params.ate = filtros.ate
  return api
    .get<Page<MovimentacaoResponse>>('/api/movimentacoes/historico', { params })
    .then((r) => r.data)
}
