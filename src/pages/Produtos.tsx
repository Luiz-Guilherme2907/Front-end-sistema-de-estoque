import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Package } from 'lucide-react'
import { listarProdutos, criarProduto, atualizarProduto, inativarProduto } from '@/api/produtos'
import type { ProdutoResponse, ProdutoRequest } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

const emptyForm: ProdutoRequest = { nome: '', descricao: '', quantidade: 0, preco: 0 }

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

const FieldInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{
      width: '100%',
      background: 'hsl(var(--input))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      padding: '8px 10px',
      color: 'hsl(var(--foreground))',
      fontFamily: 'Martian Mono, monospace',
      fontSize: '12px',
      transition: 'border-color 0.15s ease',
      outline: 'none',
      boxSizing: 'border-box' as const,
    }}
    onFocus={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--amber) / 0.55)' }}
    onBlur={(e) => { e.currentTarget.style.borderColor = 'hsl(var(--border))' }}
  />
)

export function Produtos() {
  const { isAdmin } = useAuth()
  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ProdutoResponse | null>(null)
  const [form, setForm] = useState<ProdutoRequest>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = (p = 0) => {
    setLoading(true)
    listarProdutos(p, 20)
      .then((data) => {
        setProdutos(data.content)
        setTotalPages(data.totalPages)
        setPage(data.number)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(0) }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (p: ProdutoResponse) => {
    setEditing(p)
    setForm({ nome: p.nome, descricao: p.descricao ?? '', quantidade: p.quantidade, preco: Number(p.preco) })
    setOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await atualizarProduto(editing.id, form)
      } else {
        await criarProduto(form)
      }
      setOpen(false)
      load(page)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Inativar este produto?')) return
    await inativarProduto(id)
    load(page)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
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
            Inventário
          </p>
          <h1 className="page-title">Produtos</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>
            Gerencie o catálogo de produtos
          </p>
        </div>

        <motion.button
          className="btn-amber"
          onClick={openCreate}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={13} />
          Novo Produto
        </motion.button>
      </motion.div>

      {/* Table panel */}
      <motion.div
        className="panel"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.07 }}
      >
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={13} color="hsl(var(--amber))" />
            <span className="panel-label">Lista de Produtos</span>
          </div>
          <span
            style={{
              fontFamily: 'Martian Mono, monospace',
              fontSize: '10px',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            {produtos.length} itens
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '20px' }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '13px 0',
                  borderBottom: '1px solid hsl(var(--border) / 0.4)',
                }}
              >
                <div className="skeleton" style={{ flex: 2, height: '11px' }} />
                <div className="skeleton" style={{ width: '40px', height: '11px' }} />
                <div className="skeleton" style={{ width: '70px', height: '11px' }} />
                <div className="skeleton" style={{ width: '50px', height: '20px' }} />
              </div>
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Quantidade</th>
                <th>Preço</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {produtos.map((p, i) => (
                <tr
                  key={p.id}
                  className="row-anim"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: 'hsl(var(--foreground))',
                      }}
                    >
                      {p.nome}
                    </p>
                    {p.descricao && (
                      <p
                        style={{
                          margin: '3px 0 0',
                          fontFamily: 'Martian Mono, monospace',
                          fontSize: '10px',
                          color: 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {p.descricao}
                      </p>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'Martian Mono, monospace',
                        color: p.quantidade <= 5 && p.ativo
                          ? 'hsl(var(--warn-fg))'
                          : 'hsl(var(--foreground))',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {p.quantidade <= 5 && p.ativo && <span className="low-stock-dot" />}
                      {p.quantidade}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'Martian Mono, monospace', fontSize: '12px' }}>
                    R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                  </td>
                  <td>
                    <span className={`badge ${p.ativo ? 'badge-active' : 'badge-inactive'}`}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => openEdit(p)} title="Editar">
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: '6px' }}
                          onClick={() => handleDelete(p.id)}
                          title="Inativar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              disabled={page === 0}
              onClick={() => load(page - 1)}
            >
              <ChevronLeft size={13} />
              Anterior
            </button>
            <span>Pág. {page + 1} / {totalPages}</span>
            <button
              className="btn-ghost"
              style={{ padding: '6px 12px', fontSize: '11px' }}
              disabled={page >= totalPages - 1}
              onClick={() => load(page + 1)}
            >
              Próxima
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 100,
                background: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(6px)',
              }}
            />

            {/* Modal card */}
            <div style={{
              position: 'fixed', inset: 0, zIndex: 101,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              pointerEvents: 'none',
            }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.92, y: 16, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                pointerEvents: 'all',
                width: '100%', maxWidth: '460px',
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px hsl(var(--amber) / 0.08)',
              }}
            >
              {/* Amber glow top */}
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, hsl(43 95% 55%), white, hsl(43 95% 55%), transparent)',
                boxShadow: '0 0 20px 4px hsl(43 95% 55%), 0 0 40px 8px hsl(43 95% 55% / 0.4)',
                borderRadius: '0 0 4px 4px',
              }} />

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '24px 28px 20px',
                borderBottom: '1px solid hsl(var(--border))',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '10px',
                    background: 'hsl(43 95% 55% / 0.12)',
                    border: '1px solid hsl(43 95% 55% / 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Package size={16} color="hsl(43 95% 55%)" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 700, color: 'hsl(var(--foreground))', letterSpacing: '-0.01em' }}>
                      {editing ? 'Editar Produto' : 'Novo Produto'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontFamily: 'Martian Mono, monospace', fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
                      {editing ? `ID #${editing.id}` : 'Preencha os campos abaixo'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="btn-icon"
                  style={{ borderRadius: '10px' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <FieldLabel>Nome</FieldLabel>
                  <FieldInput
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <FieldLabel>Descrição</FieldLabel>
                  <FieldInput
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <FieldLabel>Quantidade</FieldLabel>
                    <FieldInput
                      type="number" min={0}
                      value={form.quantidade}
                      onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Preço (R$)</FieldLabel>
                    <FieldInput
                      type="number" min={0.01} step={0.01}
                      value={form.preco}
                      onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', justifyContent: 'flex-end', gap: '10px',
                padding: '16px 28px 24px',
                borderTop: '1px solid hsl(var(--border))',
              }}>
                <button className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
                <motion.button
                  className="btn-amber"
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? '▸ Salvando...' : editing ? '▸ Salvar Alterações' : '▸ Criar Produto'}
                </motion.button>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
