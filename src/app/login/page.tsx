'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const { accessToken, setSession } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (accessToken) router.replace('/dashboard')
  }, [accessToken, router])

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX - window.innerWidth / 2) / 25,
      y: (e.clientY - window.innerHeight / 2) / 25,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const data = await api.login(email, password)
      setSession(data.accessToken, data.refreshToken, data.user)
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Сервертэй холбогдож чадсангүй')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#070b1a]"
      onMouseMove={handleMouseMove}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 transition-transform duration-700 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(238 84% 67%) 0%, transparent 70%)',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, hsl(262 83% 65%) 0%, transparent 70%)',
            transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Brand */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <span className="text-2xl font-black text-white">C</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">Клиент Админ</h1>
          <p className="text-slate-400 text-sm">Контент удирдлага · Content CMS</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 animate-fade-in-up"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            animationDelay: '80ms',
          }}
        >
          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: '#fca5a5',
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Имэйл</label>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'email' ? 'text-indigo-400' : 'text-slate-500'}`}
                />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                  style={{
                    background: focused === 'email' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                    border: focused === 'email' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                  }}
                  placeholder="client@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Нууц үг</label>
              <div className="relative">
                <Lock
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'password' ? 'text-indigo-400' : 'text-slate-500'}`}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white placeholder-slate-600 outline-none transition-all"
                  style={{
                    background: focused === 'password' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                    border: focused === 'password' ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
                  }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, hsl(238 84% 67%), hsl(262 83% 55%))',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Нэвтэрч байна...
                </>
              ) : (
                <>
                  Нэвтрэх
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[11px] tracking-widest uppercase text-slate-600">
          Powered by <span className="text-slate-400 font-bold">Zevtabs</span>
        </p>
      </div>
    </div>
  )
}
