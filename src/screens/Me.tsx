import { useState } from 'react'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { HeaderDivider } from '../components/HeaderDivider'
import { IconGoogle, IconUser } from '../components/icons'
import { Modal } from '../components/Modal'
import { useAuthStore } from '../store/authStore'

export function Me() {
  const { user, loading, signInWithGoogle, continueAsGuest, signOut } = useAuthStore()
  const [confirmingGuest, setConfirmingGuest] = useState(false)
  const [startingGuest, setStartingGuest] = useState(false)
  const [confirmingExit, setConfirmingExit] = useState(false)
  const [exiting, setExiting] = useState(false)

  async function handleContinueAsGuest() {
    setStartingGuest(true)
    await continueAsGuest()
    setStartingGuest(false)
    setConfirmingGuest(false)
  }

  async function handleExit() {
    setExiting(true)
    await signOut()
    setExiting(false)
    setConfirmingExit(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center p-6">
        <p className="text-sm text-graphite">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-3xl font-bold text-ink">Gains</h1>
        <p className="text-sm text-graphite">Sign in to start your workout journal.</p>
        <Button
          variant="primary"
          leftIcon={<IconGoogle className="h-4 w-4" />}
          onClick={signInWithGoogle}
        >
          Continue with Google
        </Button>
        <Button
          variant="tertiary"
          className="underline"
          onClick={() => setConfirmingGuest(true)}
        >
          Continue without logging in
        </Button>

        <Modal
          isOpen={confirmingGuest}
          onClose={() => setConfirmingGuest(false)}
          title="Continue without an account?"
        >
          <p>
            Your workouts won't be backed up or synced to any account. If you clear your
            browser data or switch devices, you'll lose them.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmingGuest(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinueAsGuest}
              disabled={startingGuest}
            >
              {startingGuest ? 'Starting...' : 'Continue'}
            </Button>
          </div>
        </Modal>
      </div>
    )
  }

  const isGuest = user.is_anonymous ?? false
  const fullName = user.user_metadata?.full_name as string | undefined
  const name = isGuest ? 'Guest' : (fullName?.split(' ')[0] ?? user.email)
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined

  return (
    <div>
      <div className="sticky top-[env(safe-area-inset-top)] z-30 bg-paper">
        <div className="px-6 pb-4 pt-6">
          <h1 className="text-2xl font-bold text-ink">Me</h1>
        </div>
        <HeaderDivider />
      </div>

      <div className="px-6 pb-6 pt-4">
        <Card className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full" />
          ) : (
            <IconUser className="h-6 w-6 shrink-0 text-ink" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="truncate text-xs text-graphite">
              {isGuest ? "Guest session — data isn't synced." : user.email}
            </p>
          </div>
        </Card>

        {isGuest && (
          <Button
            variant="primary"
            leftIcon={<IconGoogle className="h-4 w-4" />}
            onClick={signInWithGoogle}
            className="mt-4 w-full"
          >
            Sign in with Google
          </Button>
        )}

        <Button
          variant="primary"
          onClick={() => (isGuest ? setConfirmingExit(true) : signOut())}
          className="mt-4 w-full"
        >
          {isGuest ? 'Exit' : 'Log out'}
        </Button>
        <p className="mt-6 text-center text-xs text-graphite">
          Exercise data by{' '}
          <a
            href="https://repdb.co"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            RepDB (repdb.co)
          </a>
        </p>

        <Modal
          isOpen={confirmingExit}
          onClose={() => setConfirmingExit(false)}
          title="Exit and lose your data?"
        >
          <p>
            Your workouts were never synced to an account. Exiting now will permanently lose
            them — are you sure?
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setConfirmingExit(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleExit} disabled={exiting}>
              {exiting ? 'Exiting...' : 'Exit'}
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
