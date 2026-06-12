'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const db = createClient()
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      db.auth.exchangeCodeForSession(code).then(({ error }) => {
        router.replace(error ? '/login' : '/')
      })
    } else {
      // Hash-based (implicit) flow — onAuthStateChange handles it automatically
      const { data: { subscription } } = db.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          subscription.unsubscribe()
          router.replace('/')
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="app-bg fixed inset-0 flex flex-col items-center justify-center gap-4">
      <div
        className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(255,106,31,.6)', borderTopColor: 'transparent' }}
      />
      <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,.4)' }}>
        Signing you in&hellip;
      </p>
    </div>
  )
}
