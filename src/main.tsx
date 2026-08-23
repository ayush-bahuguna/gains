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
function checkForUpdate() {
  if (document.visibilityState === 'visible') updateSW()
}
document.addEventListener('visibilitychange', checkForUpdate)
window.addEventListener('pageshow', checkForUpdate)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
