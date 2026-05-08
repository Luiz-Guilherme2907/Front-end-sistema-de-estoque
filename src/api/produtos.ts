import api from './client'
import type { Page, ProdutoRequest, ProdutoResponse } from '@/types'

export const listarProdutos = (page = 0, size = 20) =>
  api.get<Page<ProdutoResponse>>('/api/produtos', { params: { page, size } }).then((r) => r.data)

export const buscarProduto = (id: number) =>
  api.get<ProdutoResponse>(`/api/produtos/${id}`).then((r) => r.data)

export const criarProduto = (data: ProdutoRequest) =>
  api.post<ProdutoResponse>('/api/produtos', data).then((r) => r.data)

export const atualizarProduto = (id: number, data: ProdutoRequest) =>
  api.put<ProdutoResponse>(`/api/produtos/${id}`, data).then((r) => r.data)

export const inativarProduto = (id: number) =>
  api.delete(`/api/produtos/${id}`)
