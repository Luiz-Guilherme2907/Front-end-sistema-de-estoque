import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, CheckCircle2, XCircle, AlertTriangle, TrendingDown } from 'lucide-react'
import { listarProdutos } from '@/api/produtos'
import type { ProdutoResponse } from '@/types'

interface Stats {
  total: number
  ativos: number
  inativos: number
  estoqueBaixo: number
}

function useCounter(target: number, duration = 900) {
  const [value, setValue] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    const update = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf.current = requestAnimationFrame(update)
    }
    raf.current = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return value
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  delay,
  pulse,
  dimmed,
  isActive,
  onEnter,
  onLeave,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent: string
  delay: number
  pulse?: boolean
  dimmed: boolean
  isActive: boolean
  onEnter: () => void
  onLeave: () => void
}) {
  const displayed = useCounter(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '20px',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        opacity: dimmed ? 0.4 : 1,
        filter: dimmed ? 'blur(1.5px)' : 'none',
        transform: isActive ? 'translateY(-8px) scale(1.02)' : dimmed ? 'scale(0.97)' : 'translateY(0) scale(1)',
        transition: 'opacity 0.3s ease, filter 0.3s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
        boxShadow: isActive ? `0 0 0 1px ${accent}44, 0 20px 48px rgba(0,0,0,0.4), 0 0 24px ${accent}22` : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Glow top bar — fills left to right on hover */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isActive ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          borderRadius: '0 0 3px 3px',
          background: `linear-gradient(90deg, transparent, ${accent}, white, ${accent}, transparent)`,
          boxShadow: `0 0 24px 6px ${accent}, 0 0 48px 12px ${accent}66`,
          transformOrigin: 'center',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${accent}15`,
          border: `1px solid ${accent}30`,
          borderRadius: '12px',
        }}>
          <Icon size={17} color={accent} strokeWidth={2} />
        </div>
        {pulse && value > 0 && <span className="low-stock-dot" />}
      </div>

      <div style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '36px',
        fontWeight: 700,
        color: 'hsl(var(--foreground))',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        marginBottom: '8px',
      }}>
        {displayed}
      </div>

      <p style={{
        margin: 0,
        fontFamily: 'Martian Mono, monospace',
        fontSize: '10px',
        letterSpacing: '0.08em',
        color: 'hsl(var(--muted-foreground))',
      }}>
        {label}
      </p>
    </motion.div>
  )
}

function SkeletonCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '20px',
          padding: '24px',
          height: '130px',
        }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '12px', marginBottom: '20px' }} />
          <div className="skeleton" style={{ width: '60px', height: '30px', marginBottom: '8px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ width: '100px', height: '10px', borderRadius: '4px' }} />
        </div>
      ))}
    </div>
  )
}

const cardDefs = [
  { key: 'total',        label: 'Total de Produtos',  icon: Package,       accent: 'hsl(43 95% 55%)',  pulse: false },
  { key: 'ativos',       label: 'Produtos Ativos',    icon: CheckCircle2,  accent: 'hsl(152 58% 62%)', pulse: false },
  { key: 'inativos',     label: 'Inativos',           icon: XCircle,       accent: 'hsl(220 8% 44%)',  pulse: false },
  { key: 'estoqueBaixo', label: 'Estoque Crítico ≤5', icon: AlertTriangle, accent: 'hsl(38 88% 68%)',  pulse: true  },
] as const

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, ativos: 0, inativos: 0, estoqueBaixo: 0 })
  const [loading, setLoading] = useState(true)
  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  useEffect(() => {
    listarProdutos(0, 100)
      .then((page) => {
        const all = page.content
        setProdutos(all.slice(0, 6))
        setStats({
          total: page.totalElements,
          ativos: all.filter((p) => p.ativo).length,
          inativos: all.filter((p) => !p.ativo).length,
          estoqueBaixo: all.filter((p) => p.quantidade <= 5 && p.ativo).length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}
      >
        <div>
          <p style={{
            margin: '0 0 4px',
            fontFamily: 'Martian Mono, monospace',
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'hsl(43 95% 55%)',
          }}>
            Visão Geral
          </p>
          <h1 className="page-title">Dashboard</h1>
        </div>
        <span style={{
          fontFamily: 'Martian Mono, monospace',
          fontSize: '10px',
          color: 'hsl(var(--muted-foreground))',
        }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </motion.div>

      {/* Stat cards */}
      {loading ? (
        <SkeletonCards />
      ) : (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {cardDefs.map(({ key, label, icon, accent, pulse }, i) => (
            <StatCard
              key={key}
              label={label}
              value={stats[key]}
              icon={icon}
              accent={accent}
              delay={i * 0.07}
              pulse={pulse}
              dimmed={hoveredCard !== null && hoveredCard !== key}
              isActive={hoveredCard === key}
              onEnter={() => setHoveredCard(key)}
              onLeave={() => setHoveredCard(null)}
            />
          ))}
        </div>
      )}

      {/* Recent products panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '20px',
          overflow: 'hidden',
        }}
      >
        {/* Panel header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'hsl(var(--muted-foreground))',
          }}>
            Produtos Recentes
          </span>
          <TrendingDown size={13} color="hsl(var(--muted-foreground))" />
        </div>

        {loading ? (
          <div style={{ padding: '24px' }}>
            {[0,1,2,3].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton" style={{ width: '140px', height: '11px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '90px', height: '9px', borderRadius: '4px' }} />
                </div>
                <div className="skeleton" style={{ width: '60px', height: '11px', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : produtos.length === 0 ? (
          <div className="loading-state">Nenhum produto cadastrado.</div>
        ) : (
          <div onMouseLeave={() => setHoveredRow(null)}>
            {produtos.map((p, i) => {
              const isDimmed = hoveredRow !== null && hoveredRow !== i
              const isHovered = hoveredRow === i
              return (
                <div
                  key={p.id}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    borderBottom: i < produtos.length - 1 ? '1px solid hsl(var(--border) / 0.4)' : 'none',
                    background: isHovered ? 'hsl(var(--accent) / 0.5)' : 'transparent',
                    opacity: isDimmed ? 0.35 : 1,
                    transition: 'background 0.2s ease, opacity 0.2s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '8px', height: '8px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: p.ativo
                        ? p.quantidade <= 5 ? 'hsl(var(--warn))' : 'hsl(var(--success-fg))'
                        : 'hsl(var(--muted-foreground))',
                      boxShadow: p.ativo
                        ? p.quantidade <= 5 ? '0 0 6px hsl(var(--warn))' : '0 0 6px hsl(var(--success-fg))'
                        : 'none',
                    }} />
                    <div>
                      <p style={{ margin: 0, fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))' }}>
                        {p.nome}
                      </p>
                      {p.descricao && (
                        <p style={{ margin: '2px 0 0', fontFamily: 'Martian Mono, monospace', fontSize: '10px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                          {p.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontFamily: 'Martian Mono, monospace', fontSize: '13px', fontWeight: 500, color: p.quantidade <= 5 ? 'hsl(var(--warn-fg))' : 'hsl(var(--foreground))' }}>
                        {p.quantidade} un.
                      </p>
                      <p style={{ margin: '2px 0 0', fontFamily: 'Martian Mono, monospace', fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>
                        R$ {Number(p.preco).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    <span className={`badge ${p.ativo ? 'badge-active' : 'badge-inactive'}`} style={{ minWidth: '56px', justifyContent: 'center', borderRadius: '20px' }}>
                      {p.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
}
