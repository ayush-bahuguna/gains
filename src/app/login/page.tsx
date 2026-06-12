'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { userId, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && userId) router.replace('/')
  }, [userId, loading, router])

  const handleGoogleSignIn = async () => {
    const db = createClient()
    await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col items-center justify-between overflow-hidden">
      {/* Top section — logo mark + wordmark + tagline */}
      <div className="relative z-10 flex flex-col items-center pt-[18vh]">
        {/* Logo mark */}
        <svg viewBox="0 0 64 64" width="72" height="72" fill="none" style={{ filter: 'drop-shadow(0 0 18px rgba(255,106,31,.65))', display: 'block' }}>
          <defs>
            <linearGradient id="logo-g" x1="8" y1="52" x2="52" y2="8" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff3416"/>
              <stop offset="50%" stopColor="#ff6a1f"/>
              <stop offset="100%" stopColor="#ffd96e"/>
            </linearGradient>
          </defs>
          <path d="M 42 15 A 20 20 0 1 0 52 32 L 40 32" stroke="url(#logo-g)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {/* Wordmark */}
        <div
          className="mt-5 text-[40px] font-extrabold leading-none uppercase"
          style={{ letterSpacing: 10, color: '#fff' }}
        >
          GAINS
        </div>
        <div
          className="mt-3 text-[14px] font-medium tracking-[0.2px] text-center px-8"
          style={{ color: 'rgba(255,255,255,.35)' }}
        >
          Track every rep. Own your progress.
        </div>
      </div>

      {/* Bottom section — sign-in button + note */}
      <div className="relative z-10 w-full px-6 pb-[max(40px,env(safe-area-inset-bottom,40px))]">
        <button
          onClick={handleGoogleSignIn}
          className="w-full h-[56px] rounded-[28px] flex items-center justify-center gap-3 cursor-pointer text-[15px] font-semibold transition-opacity active:opacity-80"
          style={{
            background: 'rgba(255,255,255,.96)',
            color: '#111',
            border: 'none',
            fontFamily: 'inherit',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,.5)',
          }}
        >
          {/* Google logo */}
          <svg width="20" height="20" viewBox="0 0 48 48" style={{ display: 'block', flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-[11px] mt-4" style={{ color: 'rgba(255,255,255,.22)' }}>
          By continuing you agree to our Terms &amp; Privacy Policy
        </p>
      </div>

      {/* Decorative glow orb at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,90,30,.18) 0%, transparent 70%)',
          transform: 'translateX(-50%) translateY(40%)',
        }}
      />
    </div>
  )
}
