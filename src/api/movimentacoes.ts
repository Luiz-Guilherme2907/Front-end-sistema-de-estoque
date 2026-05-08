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
