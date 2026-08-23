import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 pb-28" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
