import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registrar } from '@/api/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Eye, EyeOff } from 'lucide-react'
import { Pupil, EyeBall, useBlink } from '@/components/ui/animated-characters-login-page'

export function Register() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [mouse, setMouse] = useState({ x: 0, y: 0 })
  const [isTyping, setIsTyping] = useState(false)
  const [lookAtEachOther, setLookAtEachOther] = useState(false)
  const [purplePeeking, setPurplePeeking] = useState(false)

  const purpleRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const yellowRef = useRef<HTMLDivElement>(null)
  const orangeRef = useRef<HTMLDivElement>(null)

  const purpleBlinking = useBlink()
  const blackBlinking = useBlink()

  useEffect(() => {
    const fn = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])

  useEffect(() => {
    if (!isTyping) { setLookAtEachOther(false); return }
    setLookAtEachOther(true)
    const t = setTimeout(() => setLookAtEachOther(false), 800)
    return () => clearTimeout(t)
  }, [isTyping])

  useEffect(() => {
    if (!(senha.length > 0 && showPassword)) { setPurplePeeking(false); return }
    const t = setTimeout(() => {
      setPurplePeeking(true)
      setTimeout(() => setPurplePeeking(false), 800)
    }, Math.random() * 3000 + 2000)
    return () => clearTimeout(t)
  }, [senha, showPassword, purplePeeking])

  const calcPos = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 }
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 3
    const dx = mouse.x - cx
    const dy = mouse.y - cy
    return {
      faceX: Math.max(-15, Math.min(15, dx / 20)),
      faceY: Math.max(-10, Math.min(10, dy / 30)),
      bodySkew: Math.max(-6, Math.min(6, -dx / 120)),
    }
  }

  const pp = calcPos(purpleRef)
  const bp = calcPos(blackRef)
  const yp = calcPos(yellowRef)
  const op = calcPos(orangeRef)

  const passwordVisible = senha.length > 0 && showPassword
  const passwordHidden = senha.length > 0 && !showPassword

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
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── Left: Characters ── */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
        {/* Brand */}
        <div className="relative z-20 flex items-center gap-2 text-lg font-semibold">
          <div className="size-8 rounded-lg bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif' }}>Estoque</span>
        </div>

        {/* Characters stage */}
        <div className="relative z-20 flex items-end justify-center h-[500px]">
          <div className="relative" style={{ width: 550, height: 400 }}>

            {/* Purple — back */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 70,
                width: 180,
                height: isTyping || passwordHidden ? 440 : 400,
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: 1,
                transform: passwordVisible
                  ? 'skewX(0deg)'
                  : isTyping || passwordHidden
                    ? `skewX(${pp.bodySkew - 12}deg) translateX(40px)`
                    : `skewX(${pp.bodySkew}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left: passwordVisible ? 20 : lookAtEachOther ? 55 : 45 + pp.faceX,
                  top: passwordVisible ? 35 : lookAtEachOther ? 65 : 40 + pp.faceY,
                }}
              >
                {[0, 1].map((i) => (
                  <EyeBall
                    key={i}
                    size={18} pupilSize={7} maxDistance={5}
                    eyeColor="white" pupilColor="#2D2D2D"
                    isBlinking={purpleBlinking}
                    forceLookX={passwordVisible ? (purplePeeking ? 4 : -4) : lookAtEachOther ? 3 : undefined}
                    forceLookY={passwordVisible ? (purplePeeking ? 5 : -4) : lookAtEachOther ? 4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Black — middle */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 240,
                width: 120,
                height: 310,
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: 2,
                transform: passwordVisible
                  ? 'skewX(0deg)'
                  : lookAtEachOther
                    ? `skewX(${bp.bodySkew * 1.5 + 10}deg) translateX(20px)`
                    : isTyping || passwordHidden
                      ? `skewX(${bp.bodySkew * 1.5}deg)`
                      : `skewX(${bp.bodySkew}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left: passwordVisible ? 10 : lookAtEachOther ? 32 : 26 + bp.faceX,
                  top: passwordVisible ? 28 : lookAtEachOther ? 12 : 32 + bp.faceY,
                }}
              >
                {[0, 1].map((i) => (
                  <EyeBall
                    key={i}
                    size={16} pupilSize={6} maxDistance={4}
                    eyeColor="white" pupilColor="#2D2D2D"
                    isBlinking={blackBlinking}
                    forceLookX={passwordVisible ? -4 : lookAtEachOther ? 0 : undefined}
                    forceLookY={passwordVisible ? -4 : lookAtEachOther ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Orange — front left */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 0, width: 240, height: 200,
                backgroundColor: '#FF9B6B',
                borderRadius: '120px 120px 0 0',
                zIndex: 3,
                transform: passwordVisible ? 'skewX(0deg)' : `skewX(${op.bodySkew}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: passwordVisible ? 50 : 82 + op.faceX,
                  top: passwordVisible ? 85 : 90 + op.faceY,
                }}
              >
                {[0, 1].map((i) => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D"
                    forceLookX={passwordVisible ? -5 : undefined}
                    forceLookY={passwordVisible ? -4 : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Yellow — front right */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: 310, width: 140, height: 230,
                backgroundColor: '#E8D754',
                borderRadius: '70px 70px 0 0',
                zIndex: 4,
                transform: passwordVisible ? 'skewX(0deg)' : `skewX(${yp.bodySkew}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: passwordVisible ? 20 : 52 + yp.faceX,
                  top: passwordVisible ? 35 : 40 + yp.faceY,
                }}
              >
                {[0, 1].map((i) => (
                  <Pupil key={i} size={12} maxDistance={5} pupilColor="#2D2D2D"
                    forceLookX={passwordVisible ? -5 : undefined}
                    forceLookY={passwordVisible ? -4 : undefined}
                  />
                ))}
              </div>
              {/* Mouth */}
              <div
                className="absolute h-[4px] bg-[#2D2D2D] rounded-full transition-all duration-200 ease-out"
                style={{
                  width: 80,
                  left: passwordVisible ? 10 : 40 + yp.faceX,
                  top: passwordVisible ? 88 : 88 + yp.faceY,
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
          <a href="#" className="hover:text-primary-foreground transition-colors">Privacidade</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Termos</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Contato</a>
        </div>

        {/* Decorative blobs */}
        <div className="absolute inset-0 bg-[size:20px_20px]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)' }} />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      {/* ── Right: Form ── */}
      <div className="flex items-center justify-center p-8" style={{ background: 'hsl(var(--background))' }}>
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif' }}>Estoque</span>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ fontFamily: 'Syne, sans-serif', color: 'hsl(var(--foreground))' }}
            >
              Criar Conta
            </h1>
            <p style={{ fontFamily: 'Martian Mono, monospace', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
              Preencha os dados para começar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium">Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                autoComplete="name"
                onChange={(e) => setNome(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12"
                style={{ color: '#111111', background: '#ffffff', caretColor: '#111111' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                className="h-12"
                style={{ color: '#111111', background: '#ffffff', caretColor: '#111111' }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  required
                  className="h-12 pr-10"
                  autoComplete="new-password"
                  style={{ color: '#111111', background: '#ffffff', caretColor: '#111111' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#555555' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#111111')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#555555')}
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm rounded-lg" style={{
                color: 'hsl(var(--destructive))',
                background: 'hsl(var(--destructive) / 0.08)',
                border: '1px solid hsl(var(--destructive) / 0.3)',
              }}>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base font-medium" size="lg" disabled={loading}>
              {loading ? 'Criando conta...' : 'Registrar'}
            </Button>
          </form>

          <div className="text-center text-sm mt-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Já tem conta?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: 'hsl(var(--foreground))' }}>
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
