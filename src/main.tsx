import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

// Force an immediate reload the moment a new build is available, instead of
// silently caching it until the user happens to hard-refresh — this app is
// still under active development and shipping frequent updates, and an
// installed PWA otherwise keeps running old JS until fully force-quit.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    window.location.reload()
  },
})

// An installed iOS PWA usually suspends its WebView instead of reloading it
// when reopened from the home screen, so the registerSW() call above never
// re-runs and never notices a new deploy. Re-check for an update every time
// the app comes back to the foreground instead.
//
// Only treat this as "the app was actually reopened" if it was hidden for a
// while — a quick visibilitychange blip (e.g. the native mic-permission
// dialog covering the page for a second) shouldn't trigger a reload, since
// that would silently kill anything in progress like a voice recording.
let hiddenAt = 0
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    hiddenAt = Date.now()
    return
  }
  if (hiddenAt && Date.now() - hiddenAt > 5000) updateSW()
})
window.addEventListener('pageshow', (e) => {
  if (e.persisted) updateSW()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
