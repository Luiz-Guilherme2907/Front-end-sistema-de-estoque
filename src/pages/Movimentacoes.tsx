import { useEffect, useState } from 'react'
import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { listarMovimentacoes, registrarMovimentacao } from '@/api/movimentacoes'
import { listarProdutos } from '@/api/produtos'
import type { MovimentacaoResponse, ProdutoResponse } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function Movimentacoes() {
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
      if (selectedProdutoId) loadMovs(selectedProdutoId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Movimentações</h1>
          <p className="text-gray-500">Histórico de entradas e saídas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Movimentação</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Produto</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  value={form.produtoId}
                  onChange={(e) => setForm({ ...form, produtoId: Number(e.target.value) })}
                >
                  <option value={0} disabled>
                    Selecione um produto
                  </option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (estoque: {p.quantidade})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  {(['ENTRADA', 'SAIDA'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: t })}
                      className={`flex-1 rounded-md border py-2 text-sm font-medium transition-colors ${
                        form.tipo === t
                          ? t === 'ENTRADA'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'ENTRADA' ? '↑ Entrada' : '↓ Saída'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Observação</Label>
                <Input
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving || form.produtoId === 0}>
                  {saving ? 'Salvando...' : 'Registrar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {produtos.map((p) => (
          <button
            key={p.id}
            onClick={() => loadMovs(p.id)}
            className={`rounded-lg border p-4 text-left transition-colors hover:border-blue-400 ${
              selectedProdutoId === p.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
            <p className="text-xs text-gray-500 mt-1">Estoque: {p.quantidade}</p>
          </button>
        ))}
      </div>

      {selectedProdutoId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico — {produtos.find((p) => p.id === selectedProdutoId)?.nome}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-gray-500">Carregando...</p>
            ) : movimentacoes.length === 0 ? (
              <p className="p-6 text-gray-500">Nenhuma movimentação encontrada.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Tipo</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Qtd.</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Observação</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {movimentacoes.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Badge variant={m.tipo === 'ENTRADA' ? 'success' : 'destructive'}>
                          {m.tipo === 'ENTRADA' ? (
                            <TrendingUp className="mr-1 h-3 w-3" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3" />
                          )}
                          {m.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{m.quantidade}</td>
                      <td className="px-6 py-4 text-gray-500">{m.observacao ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(m.criadoEm).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
