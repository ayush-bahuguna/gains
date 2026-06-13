'use client'
import { useState, useEffect } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { useAuth } from '@/contexts/AuthContext'
import { getProfile, upsertProfile } from '@/lib/db/profile'
import { getHomeStats } from '@/lib/db/analytics'

export default function ProfilePage() {
  const { userId, user, signOut } = useAuth()
  const [name,       setName]       = useState('Gains User')
  const [nickname,   setNickname]   = useState('The Gainz Goblin')
  const [weight,      setWeight]      = useState('82.5')
  const [height,      setHeight]      = useState('178')
  const [units,       setUnits]       = useState<'kg'|'lbs'>('kg')
  const [showEdit,    setShowEdit]    = useState(false)
  const [editName,    setEditName]    = useState('')
  const [editNick,    setEditNick]    = useState('')
  const [editWeight,  setEditWeight]  = useState('')
  const [editHeight,  setEditHeight]  = useState('')

  // Stats
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [streak,        setStreak]        = useState(0)

  useEffect(() => {
    if (!userId) return

    getProfile(userId).then(p => {
      if (p?.display_name) setName(p.display_name)
      else if (user?.name) setName(user.name)
      if (p?.nickname)  setNickname(p.nickname)
      if (p?.weight_kg) setWeight(String(p.weight_kg))
      if (p?.height_cm) setHeight(String(p.height_cm))
      if (p?.unit_pref) setUnits(p.unit_pref as 'kg' | 'lbs')
    })

    // All-time stats from sessions (approximate via analytics)
    getHomeStats(userId).then(s => {
      setStreak(s.streak)
      // getHomeStats only covers recent data; total workouts would need a separate count
    })

    // Simple count of all sessions
    ;(async () => {
      const { createClient } = await import('@/lib/supabase')
      const db = createClient()
      const { count } = await db
        .from('workout_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', false)
      setTotalWorkouts(count ?? 0)
    })()
  }, [userId])

  const displayWeight = units === 'kg'
    ? weight
    : String(Math.round(parseFloat(weight) * 2.205 * 10) / 10)

  const openEdit = () => {
    setEditName(name); setEditNick(nickname); setEditWeight(weight); setEditHeight(height)
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (editName)   setName(editName)
    if (editNick)   setNickname(editNick)
    if (editWeight) setWeight(editWeight)
    if (editHeight) setHeight(editHeight)
    setShowEdit(false)
    if (userId) {
      await upsertProfile(userId, {
        display_name: editName || name,
        nickname:     editNick || nickname,
        weight_kg:    parseFloat(editWeight || weight) || null,
        height_cm:    parseFloat(editHeight || height) || null,
        unit_pref:    units,
      })
    }
  }

  const handleUnitsChange = async (u: 'kg' | 'lbs') => {
    setUnits(u)
    if (userId) await upsertProfile(userId, { unit_pref: u })
  }

  return (
    <div className="app-bg app-glow fixed inset-0 flex flex-col overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between px-[22px] pt-[14px] pb-0">
        <h1 className="text-[22px] font-extrabold tracking-[-0.4px] m-0">Profile</h1>
        <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer" style={{ background: 'rgba(255,255,255,.07)' }}>
          <svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>
      </div>

      {/* Scroll */}
      <div
        className="relative z-10 flex-1 overflow-y-auto"
        style={{ padding: '12px 20px', paddingBottom: 'calc(110px + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Avatar + name */}
        <div className="flex flex-col items-center py-4 pb-5">
          <div className="relative w-[88px] h-[88px]">
            <div className="w-[88px] h-[88px] rounded-full p-[3px]" style={{ background: 'linear-gradient(150deg,rgba(255,140,60,.7),rgba(255,255,255,.12))' }}>
              <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt={name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <svg viewBox="0 0 24 24" width={42} height={42} fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,.35)', display: 'block' }}>
                    <path d="M12 4a3.6 3.6 0 1 0 0 7.2A3.6 3.6 0 0 0 12 4z" />
                    <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className="mt-[14px] text-[24px] font-extrabold tracking-[-0.4px] text-center">{name}</div>
          <div className="mt-1 text-[14px] font-medium text-center" style={{ color: 'rgba(255,255,255,.45)' }}>{nickname}</div>
          <div
            onClick={openEdit}
            className="mt-[14px] flex items-center gap-[7px] px-[22px] py-[9px] rounded-[22px] cursor-pointer text-[13px] font-semibold"
            style={{ border: '1px solid rgba(255,255,255,.14)', background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.8)' }}
          >
            <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid gap-2 mb-5" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          {[
            { label:'Workouts',  value: String(totalWorkouts), warm: false },
            { label:'Day Streak',value: String(streak),        warm: true  },
            { label:'Height',    value: height,                warm: false },
          ].map(s => (
            <div key={s.label} className="rounded-[18px] px-[10px] py-[13px] text-center" style={{ background: s.warm ? 'rgba(255,150,60,.1)' : 'rgba(255,255,255,.05)', border: s.warm ? '1px solid rgba(255,140,60,.2)' : '1px solid rgba(255,255,255,.08)' }}>
              <div className="font-doto text-[26px] font-bold leading-none" style={{ letterSpacing: 2, color: s.warm ? 'rgba(255,200,120,.95)' : '#fff' }}>{s.value}</div>
              <div className="text-[10px] font-medium mt-[5px]" style={{ color: s.warm ? 'rgba(255,160,80,.45)' : 'rgba(255,255,255,.32)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Body stats */}
        <div className="text-[11px] font-bold uppercase tracking-[1.2px] mb-[10px]" style={{ color: 'rgba(255,255,255,.35)' }}>Body</div>
        <div className="grid gap-[10px] mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="rounded-[20px] p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[.9px] mb-2" style={{ color: 'rgba(255,255,255,.32)' }}>Weight</div>
            <div className="font-doto text-[28px] font-bold leading-none" style={{ letterSpacing: 2 }}>{displayWeight}</div>
            <div className="text-[11px] font-medium mt-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>{units}</div>
          </div>
          <div className="rounded-[20px] p-4" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="text-[10px] font-bold uppercase tracking-[.9px] mb-2" style={{ color: 'rgba(255,255,255,.32)' }}>Height</div>
            <div className="font-doto text-[28px] font-bold leading-none" style={{ letterSpacing: 2 }}>{height}</div>
            <div className="text-[11px] font-medium mt-[5px]" style={{ color: 'rgba(255,255,255,.35)' }}>cm</div>
          </div>
        </div>

        {/* Settings */}
        <div className="text-[11px] font-bold uppercase tracking-[1.2px] mb-[10px]" style={{ color: 'rgba(255,255,255,.35)' }}>Settings</div>
        <div className="rounded-[20px] overflow-hidden" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
          <div className="px-4 py-[14px] flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div className="text-[15px] font-semibold">Units</div>
            <div className="flex gap-1 rounded-[16px] p-[3px]" style={{ background: 'rgba(255,255,255,.07)' }}>
              {(['kg','lbs'] as const).map(u => {
                const on = units === u
                return (
                  <div key={u} onClick={() => handleUnitsChange(u)} className="px-4 py-[5px] rounded-[13px] text-[12px] font-bold cursor-pointer"
                    style={{ background: on ? 'rgba(255,120,60,.85)' : 'transparent', color: on ? '#fff' : 'rgba(255,255,255,.42)' }}>{u}</div>
                )
              })}
            </div>
          </div>
          <div className="px-4 py-[14px] flex items-center justify-between cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div className="text-[15px] font-semibold">Export Data</div>
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="rgba(255,255,255,.32)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}><path d="M9 18l6-6-6-6" /></svg>
          </div>
          <div
            className="px-4 py-[14px] flex items-center gap-3 cursor-pointer"
            onClick={signOut}
          >
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="rgba(239,68,68,.8)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <div className="text-[15px] font-semibold" style={{ color: 'rgba(239,68,68,.9)' }}>Sign Out</div>
          </div>
        </div>
      </div>

      <BottomNav active="profile" />

      {/* Edit sheet */}
      {showEdit && (
        <>
          <div className="absolute inset-0 z-20" style={{ background: 'rgba(0,0,0,.62)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} onClick={() => setShowEdit(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-[21] rounded-[30px_30px_0_0] px-[22px] pb-12 pt-4" style={{ background: 'linear-gradient(170deg,#241510,#170d0a)', borderTop: '1px solid rgba(255,255,255,.11)' }}>
            <div className="w-8 h-1 rounded-[2px] mx-auto mb-5" style={{ background: 'rgba(255,255,255,.15)' }} />
            <div className="text-[19px] font-extrabold tracking-[-0.4px] mb-5">Edit Profile</div>
            {[
              { label:'Display Name',       value:editName,   onChange:(v:string) => setEditName(v),   placeholder:'Your name',            type:'text'   },
              { label:'Nickname',           value:editNick,   onChange:(v:string) => setEditNick(v),   placeholder:'e.g. The Gainz Goblin', type:'text'   },
              { label:'Body Weight (kg)',   value:editWeight, onChange:(v:string) => setEditWeight(v), placeholder:'e.g. 82.5',            type:'number' },
              { label:'Height (cm)',        value:editHeight, onChange:(v:string) => setEditHeight(v), placeholder:'e.g. 178',             type:'number' },
            ].map(f => (
              <div key={f.label} className="mb-[14px]">
                <div className="text-[11px] font-bold uppercase tracking-[.8px] mb-[7px]" style={{ color: 'rgba(255,255,255,.4)' }}>{f.label}</div>
                <input type={f.type} value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder}
                  className="w-full h-[46px] rounded-[14px] text-white text-[15px] font-medium px-[14px]"
                  style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', fontFamily: 'inherit' }} />
              </div>
            ))}
            <button onClick={saveEdit} className="cta-gradient w-full h-[52px] rounded-[26px] border-none cursor-pointer text-[15px] font-bold tracking-[.8px] text-white mb-[10px]" style={{ fontFamily: 'inherit' }}>Save</button>
            <button onClick={() => setShowEdit(false)} className="w-full h-11 rounded-[26px] cursor-pointer text-[14px] font-semibold bg-transparent" style={{ border: '1px solid rgba(255,255,255,.1)', color: 'rgba(255,255,255,.42)', fontFamily: 'inherit' }}>Cancel</button>
          </div>
        </>
      )}
    </div>
  )
}
