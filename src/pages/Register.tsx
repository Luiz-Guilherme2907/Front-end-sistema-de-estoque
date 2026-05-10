import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registrar } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'

const Label = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      display: 'block',
      fontFamily: 'Syne, sans-serif',
      fontSize: '9px',
      fontWeight: 600,
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      color: 'hsl(var(--muted-foreground))',
      marginBottom: '8px',
    }}
  >
    {children}
  </span>
)

export function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await registrar({ nome, email, senha })
      signIn(data)
      navigate('/dashboard')
    } catch {
      setError('Erro ao criar conta. Verifique os dados informados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="bg-dot-grid"
      style={{
        minHeight: '100vh',
        background: 'hsl(var(--background))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '360px' }}>
        {/* Header */}
        <div
          className="animate-fade-up delay-0"
          style={{ textAlign: 'center', marginBottom: '32px' }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              border: '1px solid hsl(var(--amber) / 0.4)',
              marginBottom: '18px',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-6px',
                border: '1px solid hsl(var(--amber) / 0.1)',
              }}
            />
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '22px',
                color: 'hsl(var(--amber))',
              }}
            >
              E
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'Syne, sans-serif',
              fontSize: '20px',
              fontWeight: 700,
              color: 'hsl(var(--foreground))',
              letterSpacing: '-0.02em',
            }}
          >
            Criar Conta
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: 'Martian Mono, monospace',
              fontSize: '10px',
              letterSpacing: '0.2em',
              color: 'hsl(var(--muted-foreground))',
              textTransform: 'uppercase',
            }}
          >
            Novo Acesso ao Sistema
          </p>
        </div>

        {/* Panel */}
        <div className="panel animate-fade-up delay-1" style={{ padding: '26px' }}>
          {/* Terminal bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingBottom: '18px',
              marginBottom: '20px',
              borderBottom: '1px solid hsl(var(--border))',
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'hsl(6 78% 50% / 0.55)', display: 'inline-block' }} />
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'hsl(38 88% 52% / 0.55)', display: 'inline-block' }} />
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'hsl(152 58% 40% / 0.55)', display: 'inline-block' }} />
            <span
              style={{
                marginLeft: '10px',
                fontFamily: 'Martian Mono, monospace',
                fontSize: '9px',
                letterSpacing: '0.18em',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              AUTH.REGISTER
            </span>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <Label>Nome</Label>
              <input
                type="text"
                className="input-terminal"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <Label>Email</Label>
              <input
                type="email"
                className="input-terminal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <Label>Senha</Label>
              <input
                type="password"
                className="input-terminal"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              type="submit"
              className="btn-amber"
              disabled={loading}
              style={{ width: '100%', marginTop: '4px' }}
            >
              {loading ? '▸ Criando conta...' : '▸ Registrar'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: '18px',
              fontFamily: 'Martian Mono, monospace',
              fontSize: '11px',
              color: 'hsl(var(--muted-foreground))',
            }}
          >
            Já tem acesso?{' '}
            <Link
              to="/login"
              style={{ color: 'hsl(var(--amber))', textDecoration: 'none' }}
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
