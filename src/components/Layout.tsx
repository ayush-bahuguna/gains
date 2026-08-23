import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="flex h-full flex-col bg-paper">
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
