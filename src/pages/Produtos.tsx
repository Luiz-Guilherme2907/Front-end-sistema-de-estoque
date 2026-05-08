import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { listarProdutos, criarProduto, atualizarProduto, inativarProduto } from '@/api/produtos'
import type { ProdutoResponse, ProdutoRequest } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const emptyForm: ProdutoRequest = { nome: '', descricao: '', quantidade: 0, preco: 0 }

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

  useEffect(() => {
    load(0)
  }, [])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-500">Gerencie o catálogo de produtos</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Nome</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Nome do produto"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Input
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.quantidade}
                      onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={form.preco}
                      onChange={(e) => setForm({ ...form, preco: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-gray-500">Carregando...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Nome</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Qtd.</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Preço</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Status</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-right font-medium text-gray-500">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.nome}</p>
                      {p.descricao && <p className="text-xs text-gray-500">{p.descricao}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{p.quantidade}</td>
                    <td className="px-6 py-4 text-gray-700">
                      R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={p.ativo ? 'success' : 'secondary'}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" disabled={page === 0} onClick={() => load(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm text-gray-500">
            Página {page + 1} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages - 1}
            onClick={() => load(page + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  )
}
