import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Shield, Hash, BadgeCheck } from 'lucide-react'
import { getMe, type UsuarioMe } from '@/api/usuarios'
import { useAuth } from '@/contexts/AuthContext'

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] },
  }),
}

function InfoRow({
  icon: Icon,
  label,
  value,
  accent,
  index,
  loading,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
  index: number
  loading?: boolean
}) {
  const amber = 'hsl(var(--amber))'
  const border = 'hsl(var(--border))'
  const muted = 'hsl(var(--muted-foreground))'
  const fg = 'hsl(var(--foreground))'

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '18px 20px',
        borderBottom: `1px solid ${border}`,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: `${accent ?? amber}18`,
          border: `1px solid ${accent ?? amber}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: accent ?? amber,
        }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: muted, marginBottom: '2px', fontFamily: 'Martian Mono, monospace', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 2px' }}>
          {label}
        </p>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="skeleton"
              style={{ width: '120px', height: '16px', borderRadius: '4px', marginTop: '4px' }}
            />
          ) : (
            <motion.p
              key="val"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ fontSize: '15px', color: fg, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}
            >
              {value}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UsuarioMe | null>(null)
  const [apiLoading, setApiLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMe()
      .then(setProfile)
      .catch(() => setError('Não foi possível carregar o perfil completo.'))
      .finally(() => setApiLoading(false))
  }, [])

  const amber = 'hsl(var(--amber))'
  const card = 'hsl(var(--card))'
  const border = 'hsl(var(--border))'
  const muted = 'hsl(var(--muted-foreground))'
  const fg = 'hsl(var(--foreground))'

  // Use dados do auth imediatamente, complementa com os da API quando chegar
  const role = profile?.role ?? user?.role ?? ''
  const email = profile?.email ?? user?.email ?? ''
  const nome = profile?.nome
  const id = profile?.id

  const roleColor = role === 'ADMIN' ? 'hsl(var(--amber))' : 'hsl(152 58% 62%)'
  const roleBg = role === 'ADMIN' ? 'hsl(var(--amber) / 0.12)' : 'hsl(152 58% 40% / 0.14)'

  const initials = nome
    ? nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : email?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 16px 120px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '480px', marginBottom: '28px' }}
      >
        <p style={{
          margin: '0 0 4px',
          fontFamily: 'Martian Mono, monospace',
          fontSize: '9px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: amber,
        }}>
          Conta
        </p>
        <h1 className="page-title">Meu Perfil</h1>
      </motion.div>

      {/* Avatar card — renderiza imediatamente */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: card,
          border: `1px solid ${border}`,
          borderRadius: '12px',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        {/* Avatar */}
        <motion.div
          style={{ position: 'relative', marginBottom: '16px' }}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <div
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              background: `${amber}20`,
              border: `2px solid ${amber}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 700,
              color: amber,
              fontFamily: 'Syne, sans-serif',
              boxShadow: `0 0 28px ${amber}30`,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={initials}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {initials}
              </motion.span>
            </AnimatePresence>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'hsl(152 58% 40%)',
              border: `2px solid ${card}`,
            }}
          />
        </motion.div>

        {/* Nome */}
        <div style={{ height: '30px', display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <AnimatePresence mode="wait">
            {apiLoading && !nome ? (
              <motion.div
                key="name-skel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="skeleton"
                style={{ width: '140px', height: '20px', borderRadius: '6px' }}
              />
            ) : (
              <motion.p
                key="name-val"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ fontSize: '20px', fontWeight: 700, color: fg, margin: 0, fontFamily: 'Syne, sans-serif' }}
              >
                {nome ?? email}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Role badge — disponível imediatamente via auth context */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 320, damping: 22 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 12px',
            borderRadius: '20px',
            background: roleBg,
            border: `1px solid ${roleColor}40`,
            color: roleColor,
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <BadgeCheck size={13} strokeWidth={2.5} />
          {role || '—'}
        </motion.div>
      </motion.div>

      {/* Info list card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '480px',
          background: card,
          border: `1px solid ${border}`,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}
      >
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '12px 20px', fontSize: '11px', color: 'hsl(var(--destructive))', margin: 0, borderBottom: `1px solid ${border}` }}
          >
            {error}
          </motion.p>
        )}

        <InfoRow icon={Hash}   label="ID"     value={id != null ? String(id) : '—'}  index={0} loading={apiLoading && id == null} />
        <InfoRow icon={User}   label="Nome"   value={nome ?? '—'}                     index={1} loading={apiLoading && !nome} />
        <InfoRow icon={Mail}   label="E-mail" value={email || '—'}                    index={2} />
        <InfoRow icon={Shield} label="Função" value={role || '—'}                     index={3} accent={roleColor} />
      </motion.div>
    </div>
  )
}
