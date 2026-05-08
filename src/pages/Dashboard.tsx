import { useEffect, useState } from 'react'
import { Package, ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react'
import { listarProdutos } from '@/api/produtos'
import type { ProdutoResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Stats {
  total: number
  ativos: number
  inativos: number
  estoqueBaixo: number
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: number
  icon: React.ElementType
  color: string
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, ativos: 0, inativos: 0, estoqueBaixo: 0 })
  const [loading, setLoading] = useState(true)
  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])

  useEffect(() => {
    listarProdutos(0, 100)
      .then((page) => {
        const all = page.content
        setProdutos(all.slice(0, 5))
        setStats({
          total: page.totalElements,
          ativos: all.filter((p) => p.ativo).length,
          inativos: all.filter((p) => !p.ativo).length,
          estoqueBaixo: all.filter((p) => p.quantidade <= 5 && p.ativo).length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-gray-500">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do estoque</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de Produtos" value={stats.total} icon={Package} color="bg-blue-500" />
        <StatCard title="Ativos" value={stats.ativos} icon={ArrowDownCircle} color="bg-green-500" />
        <StatCard title="Inativos" value={stats.inativos} icon={ArrowUpCircle} color="bg-gray-400" />
        <StatCard
          title="Estoque Baixo (≤5)"
          value={stats.estoqueBaixo}
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {produtos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">{p.nome}</p>
                  <p className="text-sm text-gray-500">{p.descricao ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{p.quantidade} un.</p>
                  <p className="text-sm text-gray-500">
                    R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
