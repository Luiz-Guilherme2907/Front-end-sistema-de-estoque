import { useEffect, useState, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { listarMovimentacoes, registrarMovimentacao, listarHistorico } from '@/api/movimentacoes'
import type { HistoricoFiltros } from '@/api/movimentacoes'
import { listarProdutos } from '@/api/produtos'
import type { MovimentacaoResponse, ProdutoResponse } from '@/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'block',
      fontFamily: 'Syne, sans-serif',
      fontSize: '9px',
      fontWeight: 600,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      color: 'hsl(var(--muted-foreground))',
      marginBottom: '8px',
    }}
  >
    {children}
  </span>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'hsl(var(--input))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '2px',
  padding: '8px 10px',
  color: 'hsl(var(--foreground))',
  fontFamily: 'Martian Mono, monospace',
  fontSize: '12px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s ease',
}

const focusAmber = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--amber) / 0.55)'
}
const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  e.currentTarget.style.borderColor = 'hsl(var(--border))'
}

function MovimentacaoRow({ m, i }: { m: MovimentacaoResponse; i: number }) {
  return (
    <tr className="row-anim" style={{ animationDelay: `${i * 35}ms` }}>
      <td>
        <span className={m.tipo === 'ENTRADA' ? 'badge badge-entrada' : 'badge badge-saida'}>
          {m.tipo === 'ENTRADA'
            ? <><TrendingUp size={10} /> Entrada</>
            : <><TrendingDown size={10} /> Saída</>}
        </span>
      </td>
      <td style={{ fontFamily: 'Martian Mono, monospace', fontSize: '12px' }}>
        {m.tipo === 'ENTRADA' ? '+' : '−'}{m.quantidade}
      </td>
      <td style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>
        {m.observacao ?? '—'}
      </td>
      <td style={{ fontFamily: 'Martian Mono, monospace', fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
        {new Date(m.criadoEm).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: '2-digit',
          hour: '2-digit', minute: '2-digit',
        })}
      </td>
    </tr>
  )
}

// ─── Admin: Histórico Geral ──────────────────────────────────────────────────

function HistoricoAdmin({ produtos }: { produtos: ProdutoResponse[] }) {
  const [filtros, setFiltros] = useState<HistoricoFiltros>({ page: 0, size: 20 })
  const [draft, setDraft] = useState({ produtoId: '', tipo: '' as '' | 'ENTRADA' | 'SAIDA', de: '', ate: '' })
  const [movs, setMovs] = useState<MovimentacaoResponse[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buscar = useCallback((f: HistoricoFiltros) => {
    setLoading(true)
    setError(null)
    listarHistorico(f)
      .then((p) => {
        setMovs(p.content)
        setTotalPages(p.totalPages)
        setTotalElements(p.totalElements)
        setFiltros(f)
      })
      .catch(() => setError('Erro ao carregar histórico.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { buscar({ page: 0, size: 20 }) }, [buscar])

  const aplicar = () => {
    buscar({
      page: 0,
      size: filtros.size ?? 20,
      produtoId: draft.produtoId ? Number(draft.produtoId) : undefined,
      tipo: draft.tipo || undefined,
      de: draft.de ? new Date(draft.de).toISOString() : undefined,
      ate: draft.ate ? new Date(draft.ate + 'T23:59:59').toISOString() : undefined,
    })
  }

  const limpar = () => {
    setDraft({ produtoId: '', tipo: '', de: '', ate: '' })
    buscar({ page: 0, size: filtros.size ?? 20 })
  }

  const changePage = (p: number) => buscar({ ...filtros, page: p })

  const currentPage = filtros.page ?? 0

  return (
    <div className="panel animate-fade-in">
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={13} color="hsl(var(--amber))" />
          <span className="panel-label">Histórico Geral</span>
          <span
            style={{
              fontFamily: 'Martian Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.12em',
              color: 'hsl(var(--amber))',
              background: 'hsl(var(--amber) / 0.1)',
              border: '1px solid hsl(var(--amber) / 0.25)',
              borderRadius: '2px',
              padding: '2px 6px',
            }}
          >
            ADMIN
          </span>
        </div>
        <span style={{ fontFamily: 'Martian Mono, monospace', fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
          {totalElements} registros
        </span>
      </div>

      {/* Filtros */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          padding: '16px',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <div>
          <FieldLabel>Produto</FieldLabel>
          <select
            className="select-terminal"
            value={draft.produtoId}
            onChange={(e) => setDraft({ ...draft, produtoId: e.target.value })}
            onFocus={focusAmber}
            onBlur={blurBorder}
          >
            <option value="">Todos</option>
            {produtos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <FieldLabel>Tipo</FieldLabel>
          <select
            className="select-terminal"
            value={draft.tipo}
            onChange={(e) => setDraft({ ...draft, tipo: e.target.value as '' | 'ENTRADA' | 'SAIDA' })}
            onFocus={focusAmber}
            onBlur={blurBorder}
          >
            <option value="">Todos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SAIDA">Saída</option>
          </select>
        </div>

        <div>
          <FieldLabel>De</FieldLabel>
          <input
            type="date"
            value={draft.de}
            onChange={(e) => setDraft({ ...draft, de: e.target.value })}
            style={inputStyle}
            onFocus={focusAmber}
            onBlur={blurBorder}
          />
        </div>

        <div>
          <FieldLabel>Até</FieldLabel>
          <input
            type="date"
            value={draft.ate}
            onChange={(e) => setDraft({ ...draft, ate: e.target.value })}
            style={inputStyle}
            onFocus={focusAmber}
            onBlur={blurBorder}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <button className="btn-amber" style={{ flex: 1 }} onClick={aplicar}>
            ▸ Filtrar
          </button>
          <button className="btn-ghost" onClick={limpar}>
            Limpar
          </button>
        </div>
      </div>

      {/* Tabela */}
      {error ? (
        <div className="loading-state" style={{ color: 'hsl(6 78% 68%)' }}>{error}</div>
      ) : loading ? (
        <div className="loading-state">▸ Carregando histórico...</div>
      ) : movs.length === 0 ? (
        <div className="loading-state">Nenhuma movimentação encontrada com estes filtros.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Observação</th>
              <th>Data / Hora</th>
            </tr>
          </thead>
          <tbody>
            {movs.map((m, i) => <MovimentacaoRow key={m.id} m={m} i={i} />)}
          </tbody>
        </table>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '12px 16px',
            borderTop: '1px solid hsl(var(--border))',
          }}
        >
          <button
            className="btn-ghost"
            style={{ padding: '4px 8px', opacity: currentPage === 0 ? 0.3 : 1 }}
            disabled={currentPage === 0}
            onClick={() => changePage(currentPage - 1)}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontFamily: 'Martian Mono, monospace', fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            className="btn-ghost"
            style={{ padding: '4px 8px', opacity: currentPage >= totalPages - 1 ? 0.3 : 1 }}
            disabled={currentPage >= totalPages - 1}
            onClick={() => changePage(currentPage + 1)}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function Movimentacoes() {
  const { isAdmin } = useAuth()
  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoResponse[]>([])
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    produtoId: 0,
    tipo: 'ENTRADA' as 'ENTRADA' | 'SAIDA',
    quantidade: 1,
    observacao: '',
  })

  useEffect(() => {
    listarProdutos(0, 100).then((p) => {
      setProdutos(p.content.filter((pr) => pr.ativo))
    })
  }, [])

  const loadMovs = (id: number) => {
    setSelectedProdutoId(id)
    setLoading(true)
    listarMovimentacoes(id)
      .then((p) => setMovimentacoes(p.content))
      .finally(() => setLoading(false))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await registrarMovimentacao(form)
      setOpen(false)
      const p = await listarProdutos(0, 100)
      setProdutos(p.content.filter((pr) => pr.ativo))
      if (selectedProdutoId) loadMovs(selectedProdutoId)
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = produtos.find((p) => p.id === selectedProdutoId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        className="animate-fade-up delay-0"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
      >
        <div>
          <p
            style={{
              margin: '0 0 4px',
              fontFamily: 'Martian Mono, monospace',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'hsl(var(--amber))',
            }}
          >
            Fluxo de Estoque
          </p>
          <h1 className="page-title">Movimentações</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
            Histórico de entradas e saídas
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="btn-amber">
              <Plus size={13} />
              Nova Movimentação
            </button>
          </DialogTrigger>
          <DialogContent
            style={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '3px',
              maxWidth: '400px',
            }}
          >
            <DialogHeader>
              <DialogTitle
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'hsl(var(--foreground))',
                  letterSpacing: '-0.01em',
                }}
              >
                Registrar Movimentação
              </DialogTitle>
            </DialogHeader>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '4px' }}>
              {/* Product select */}
              <div>
                <FieldLabel>Produto</FieldLabel>
                <select
                  className="select-terminal"
                  value={form.produtoId}
                  onChange={(e) => setForm({ ...form, produtoId: Number(e.target.value) })}
                >
                  <option value={0} disabled>Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — estoque: {p.quantidade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <FieldLabel>Tipo</FieldLabel>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {(['ENTRADA', 'SAIDA'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: t })}
                      style={{
                        flex: 1,
                        padding: '10px 0',
                        border: '1px solid',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontFamily: 'Syne, sans-serif',
                        fontSize: '10px',
                        fontWeight: 600,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                        ...(form.tipo === t
                          ? t === 'ENTRADA'
                            ? {
                                background: 'hsl(152 58% 40% / 0.14)',
                                color: 'hsl(152 58% 62%)',
                                borderColor: 'hsl(152 58% 40% / 0.4)',
                              }
                            : {
                                background: 'hsl(6 78% 56% / 0.12)',
                                color: 'hsl(6 78% 68%)',
                                borderColor: 'hsl(6 78% 56% / 0.4)',
                              }
                          : {
                              background: 'transparent',
                              color: 'hsl(var(--muted-foreground))',
                              borderColor: 'hsl(var(--border))',
                            }),
                      }}
                    >
                      {t === 'ENTRADA'
                        ? <><TrendingUp size={12} /> Entrada</>
                        : <><TrendingDown size={12} /> Saída</>
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade */}
              <div>
                <FieldLabel>Quantidade</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                  style={inputStyle}
                  onFocus={focusAmber}
                  onBlur={blurBorder}
                />
              </div>

              {/* Observação */}
              <div>
                <FieldLabel>Observação</FieldLabel>
                <input
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  placeholder="Opcional"
                  style={inputStyle}
                  onFocus={focusAmber}
                  onBlur={blurBorder}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                <button className="btn-ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="btn-amber"
                  onClick={handleSave}
                  disabled={saving || form.produtoId === 0}
                >
                  {saving ? '▸ Registrando...' : '▸ Registrar'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Product chips */}
      {produtos.length > 0 && (
        <div
          className="animate-fade-up delay-1"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '10px',
          }}
        >
          {produtos.map((p, i) => (
            <button
              key={p.id}
              className={`product-chip row-anim${selectedProdutoId === p.id ? ' selected' : ''}`}
              style={{ animationDelay: `${i * 35}ms` }}
              onClick={() => loadMovs(p.id)}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: selectedProdutoId === p.id ? 'hsl(var(--amber))' : 'hsl(var(--foreground))',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.nome}
              </p>
              <p
                style={{
                  margin: '4px 0 0',
                  fontFamily: 'Martian Mono, monospace',
                  fontSize: '10px',
                  color: p.quantidade <= 5
                    ? 'hsl(var(--warn-fg))'
                    : 'hsl(var(--muted-foreground))',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                {p.quantidade <= 5 && <span className="low-stock-dot" style={{ width: '5px', height: '5px' }} />}
                {p.quantidade} un.
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Movement table — por produto */}
      {selectedProdutoId && (
        <div className="panel animate-fade-in">
          <div className="panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowLeftRight size={13} color="hsl(var(--amber))" />
              <span className="panel-label">
                Histórico — {selectedProduct?.nome ?? '...'}
              </span>
            </div>
            <span
              style={{
                fontFamily: 'Martian Mono, monospace',
                fontSize: '10px',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              {movimentacoes.length} registros
            </span>
          </div>

          {loading ? (
            <div className="loading-state">▸ Carregando movimentações...</div>
          ) : movimentacoes.length === 0 ? (
            <div className="loading-state">Nenhuma movimentação registrada para este produto.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Quantidade</th>
                  <th>Observação</th>
                  <th>Data / Hora</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m, i) => <MovimentacaoRow key={m.id} m={m} i={i} />)}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Histórico Geral — somente ADMIN */}
      {isAdmin && <HistoricoAdmin produtos={produtos} />}
    </div>
  )
}
