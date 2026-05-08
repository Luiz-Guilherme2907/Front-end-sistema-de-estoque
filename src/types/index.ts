export interface ProdutoResponse {
  id: number
  nome: string
  descricao: string | null
  quantidade: number
  preco: number
  ativo: boolean
}

export interface MovimentacaoResponse {
  id: number
  produtoId: number
  nomeProduto: string
  tipo: 'ENTRADA' | 'SAIDA'
  quantidade: number
  observacao: string | null
  criadoEm: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface AuthResponse {
  token: string
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
}

export interface ProdutoRequest {
  nome: string
  descricao?: string
  quantidade: number
  preco: number
}

export interface MovimentacaoRequest {
  produtoId: number
  tipo: 'ENTRADA' | 'SAIDA'
  quantidade: number
  observacao?: string
}
